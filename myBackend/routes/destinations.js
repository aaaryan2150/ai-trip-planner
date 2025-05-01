// backend/routes/destinations.js
import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';



const router = express.Router();

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use backend environment variable
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Helper function to parse destinations from API response
function parseDestinations(text) {
  // Check for JSON array at the end of the text and remove it if present
  const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (jsonMatch) {
    text = text.replace(jsonMatch[0], "");
  }

  // Identify numbered destination patterns
  const destinationBlocks = text.split(/\*\*\d+\.\s+/).slice(1);

  // If we couldn't find any numbered patterns, try another approach
  if (destinationBlocks.length === 0) {
    return parseUnstructuredDestinations(text);
  }

  const destinations = destinationBlocks.map((block, index) => {
    // Extract destination name
    const nameMatch = block.match(/^([^*]+)\*\*/);
    let name = nameMatch ? nameMatch[1].trim() : `Destination ${index + 1}`;

    // If name has parenthesis, extract them separately
    const parenthesisMatch = name.match(/^([^(]+)\(([^)]+)\)$/);
    let category = null;
    if (parenthesisMatch) {
      name = parenthesisMatch[1].trim();
      category = parenthesisMatch[2].trim();
    }

    // Extract coordinates with various possible formats
    let coordinates = null;

    // Format: Latitude/Longitude: DD.DDDD° N, DD.DDDD° W
    const coordsMatch = block.match(
      /\*\*Latitude\/Longitude[^:]*:\*\*\s*([^)]*\))?\s*(\d+\.\d+)°\s+([NS]),\s*(\d+\.\d+)°\s+([EW])/i
    );

    // Format: Latitude: DD.DDDD° N, Longitude: DD.DDDD° W
    const latMatch = block.match(/\*\*Latitude:\*\*\s+(\d+\.\d+)°\s+([NS])/i);
    const lngMatch = block.match(/\*\*Longitude:\*\*\s+(\d+\.\d+)°\s+([EW])/i);

    if (coordsMatch) {
      const locationNote = coordsMatch[1] ? coordsMatch[1].trim() : null;
      const latitude =
        parseFloat(coordsMatch[2]) *
        (coordsMatch[3].toUpperCase() === "N" ? 1 : -1);
      const longitude =
        parseFloat(coordsMatch[4]) *
        (coordsMatch[5].toUpperCase() === "E" ? 1 : -1);

      coordinates = {
        ...(locationNote && { note: locationNote }),
        latitude,
        longitude,
      };
    } else if (latMatch && lngMatch) {
      const latitude =
        parseFloat(latMatch[1]) * (latMatch[2].toUpperCase() === "N" ? 1 : -1);
      const longitude =
        parseFloat(lngMatch[1]) * (lngMatch[2].toUpperCase() === "E" ? 1 : -1);

      coordinates = {
        latitude,
        longitude,
      };
    } else {
      // Try to find any coordinate-like patterns in the text
      const genericCoordMatch = block.match(
        /(\d+\.\d+)°\s+([NS]).*?(\d+\.\d+)°\s+([EW])/i
      );
      if (genericCoordMatch) {
        const latitude =
          parseFloat(genericCoordMatch[1]) *
          (genericCoordMatch[2].toUpperCase() === "N" ? 1 : -1);
        const longitude =
          parseFloat(genericCoordMatch[3]) *
          (genericCoordMatch[4].toUpperCase() === "E" ? 1 : -1);

        coordinates = {
          latitude,
          longitude,
        };
      }
    }

    // Extract focus
    const focusMatch = block.match(/\*\*Focus:\*\*\s*([^*]+)/);
    const focus = focusMatch ? focusMatch[1].trim() : "";

    // Extract description (if available)
    const descMatch = block.match(/\*\*Description:\*\*\s*([^*]+)/);
    const description = descMatch ? descMatch[1].trim() : "";

    // Extract activities
    const activitiesSection = block.match(
      /\*\*Possible Activities:\*\*\s*([\s\S]+?)(?=\*\*\d+\.|$)/
    );
    const activities = {};

    if (activitiesSection) {
      const activitiesText = activitiesSection[1];

      // Extract categories of activities
      const categoryMatches = [
        ...activitiesText.matchAll(/\*\*([^:*]+):\*\*\s*([^*]+)/g),
      ];

      for (const match of categoryMatches) {
        const categoryName = match[1].trim();
        const categoryActivities = match[2].trim();
        activities[categoryName] = categoryActivities;
      }

      // If no structured categories found, try to extract bullet points
      if (Object.keys(activities).length === 0) {
        const bulletPoints = activitiesText
          .split("*")
          .filter((item) => item.trim().length > 0);
        if (bulletPoints.length > 0) {
          activities["General"] = bulletPoints
            .map((point) => point.trim())
            .join(", ");
        }
      }
    }

    // Extract why days or itinerary info (dynamic days value)
    const whyMatch = block.match(/\*\*Why \d+ Days:\*\*\s*([^*]+)/);
    const itineraryMatch = block.match(
      /\*\*\d+-Day Itinerary[^:]*:\*\*\s*([\s\S]+?)(?=\*\*|$)/
    );

    const whyDays = whyMatch ? whyMatch[1].trim() : "";
    const itinerary = itineraryMatch ? itineraryMatch[1].trim() : "";

    return {
      id: index + 1,
      name,
      ...(category && { category }),
      ...(focus && { focus }),
      ...(description && { description }),
      ...(coordinates && { coordinates }),
      ...(Object.keys(activities).length > 0 && { activities }),
      ...(whyDays && { whyDays }),
      ...(itinerary && { itinerary }),
    };
  });

  return destinations;
}

function parseUnstructuredDestinations(text) {
  // Look for any sections that might contain location names and coordinates
  const locations = [];

  // Find patterns like "Location Name (lat: X, long: Y)"
  const locPattern =
    /([A-Za-z\s&]+)(?:\([^)]*\))?\s*(?::|-)?\s*(?:latitude|lat)?\.?\s*:?\s*(\d+\.\d+)°?\s*([NS])[,\s]+(?:longitude|long)?\.?\s*:?\s*(\d+\.\d+)°?\s*([EW])/gi;

  let match;
  while ((match = locPattern.exec(text)) !== null) {
    const name = match[1].trim();
    const latitude =
      parseFloat(match[2]) * (match[3].toUpperCase() === "N" ? 1 : -1);
    const longitude =
      parseFloat(match[4]) * (match[5].toUpperCase() === "E" ? 1 : -1);

    locations.push({
      id: locations.length + 1,
      name,
      coordinates: {
        latitude,
        longitude,
      },
    });
  }

  return locations;
}

function processApiResponse(apiResponse) {
  try {
    // Extract the content from the API response
    const content = apiResponse.choices[0].message.content;
    
    // Parse the destinations
    const destinations = parseDestinations(content);
    
    return destinations;
  } catch (error) {
    console.error("Error processing API response:", error);
    return [];
  }
}

// GET endpoint for destinations
router.get('/', async (req, res) => {
  try {
    const { country, state, days } = req.query;
    
    // Input validation
    if (!country || !state || !days) {
      return res.status(400).json({ 
        error: 'Missing required parameters. Please provide country, state, and days.' 
      });
    }
    
    const destinations = await getDestinations(country, state, days);
    return res.json({ destinations });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// Function to get destinations
async function getDestinations(country, state, days) {
  try {
    // Create a structured prompt
    const prompt = `Suggest ${days} day travel destinations in ${state}, ${country}.

    For each destination, please include:
    1. A descriptive name with category in parentheses (e.g., "San Francisco (City & Nature)")
    2. The focus or main attractions
    3. Precise latitude/longitude coordinates (specify the location they represent)
    4. Possible activities categorized by type

    Format each destination with:
    - Name
    - Focus
    - Latitude/Longitude
    - Possible Activities (categorized)`;

    // Make the API request
    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
    });

    // Parse the destinations from the response
    const destinations = processApiResponse(response);
    console.log(destinations);
    return destinations;
    


    
  } catch (error) {
    console.error("Error getting destinations:", error);
    throw error; // Let the route handler deal with the error
  }
}




export default router;