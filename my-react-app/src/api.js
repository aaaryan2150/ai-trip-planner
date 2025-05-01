import 'dotenv/config'; // if using ES Modules (you are)
import OpenAI from "openai";

console.log('API KEY =', process.env.OPENAI_API_KEY);  // debug line


async function getDestinations(country, state, days) {
  try {
    // Initialize the API client
    const openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true ,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });

    // const prompt =
    //   "Suggest 5 day travel destinations in calafornia, usa, with latitude and longitude.";
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

    console.log("check 1");

    // Parse the destinations from the response
    const destinations = processApiResponse(response);

    return destinations;
  } catch (error) {
    console.error("Error getting destinations:", error);
    return [];
  }
}

// function parseDestinations(text) {
//   // Check if there's a section header and get the content after it
//   let contentSection = text;
//   if (text.includes("**Here are the 5 destinations:**")) {
//     contentSection = text.split("**Here are the 5 destinations:**")[1];
//   }

//   // Try to identify numbered destination patterns
//   const destinationBlocks = contentSection.split(/\d+\.\s+\*\*/).slice(1);

//   // If we couldn't find any numbered patterns, try another approach
//   if (destinationBlocks.length === 0) {
//     return parseUnstructuredDestinations(text);
//   }

//   const destinations = destinationBlocks.map((block, index) => {
//     // Extract destination name (everything before the first colon after **)
//     const nameMatch = block.match(/^([^(*:]+)(?:\([^)]+\))?:/);
//     let name = nameMatch ? nameMatch[1].trim() : `Destination ${index + 1}`;

//     // If name has parenthesis, extract them separately
//     const fullNameMatch = block.match(/^([^(]+)\(([^)]+)\):/);
//     let category = null;
//     if (fullNameMatch) {
//       name = fullNameMatch[1].trim();
//       category = fullNameMatch[2].trim();
//     }

//     // Extract coordinates with various possible formats
//     let coordinates = null;

//     // Format 1: Latitude/Longitude (note): DD.DDDD° N, DD.DDDD° W
//     const coordsMatch1 = block.match(
//       /Latitude\/Longitude[^:]*:\*\*\s*([^)]+\))\s*:\s*(\d+\.\d+)°\s+([NS]),\s*(\d+\.\d+)°\s+([EW])/i
//     );

//     // Format 2: Latitude: DD.DDDD° N, Longitude: DD.DDDD° W
//     const latMatch = block.match(/\*\*Latitude:\*\*\s+(\d+\.\d+)°\s+([NS])/i);
//     const lngMatch = block.match(/\*\*Longitude:\*\*\s+(\d+\.\d+)°\s+([EW])/i);

//     if (coordsMatch1) {
//       const locationNote = coordsMatch1[1].trim();
//       const latitude =
//         parseFloat(coordsMatch1[2]) *
//         (coordsMatch1[3].toUpperCase() === "N" ? 1 : -1);
//       const longitude =
//         parseFloat(coordsMatch1[4]) *
//         (coordsMatch1[5].toUpperCase() === "E" ? 1 : -1);

//       coordinates = {
//         note: locationNote,
//         latitude,
//         longitude,
//       };
//     } else if (latMatch && lngMatch) {
//       const latitude =
//         parseFloat(latMatch[1]) * (latMatch[2].toUpperCase() === "N" ? 1 : -1);
//       const longitude =
//         parseFloat(lngMatch[1]) * (lngMatch[2].toUpperCase() === "E" ? 1 : -1);

//       coordinates = {
//         latitude,
//         longitude,
//       };
//     } else {
//       // Try to find any coordinate-like patterns in the text
//       const genericCoordMatch = block.match(
//         /(\d+\.\d+)°\s+([NS]).*?(\d+\.\d+)°\s+([EW])/i
//       );
//       if (genericCoordMatch) {
//         const latitude =
//           parseFloat(genericCoordMatch[1]) *
//           (genericCoordMatch[2].toUpperCase() === "N" ? 1 : -1);
//         const longitude =
//           parseFloat(genericCoordMatch[3]) *
//           (genericCoordMatch[4].toUpperCase() === "E" ? 1 : -1);

//         coordinates = {
//           latitude,
//           longitude,
//         };
//       }
//     }

//     // Extract focus
//     const focusMatch = block.match(/\*\*Focus:\*\*\s*([^*]+)/);
//     const focus = focusMatch ? focusMatch[1].trim() : "";

//     // Extract description (if available)
//     const descMatch = block.match(/\*\*Description:\*\*\s*([^*]+)/);
//     const description = descMatch ? descMatch[1].trim() : "";

//     // Extract activities
//     const activitiesSection = block.match(
//       /\*\*Possible Activities:\*\*\s*([\s\S]+?)(?=\*\*Why|$)/
//     );
//     const activities = {};

//     if (activitiesSection) {
//       const activitiesText = activitiesSection[1];

//       // Extract categories of activities
//       const categoryMatches = [
//         ...activitiesText.matchAll(/\*\*([^:*]+):\*\*\s*([^*]+)/g),
//       ];

//       for (const match of categoryMatches) {
//         const categoryName = match[1].trim();
//         const categoryActivities = match[2].trim();
//         activities[categoryName] = categoryActivities;
//       }

//       // If no structured categories found, try to extract bullet points
//       if (Object.keys(activities).length === 0) {
//         const bulletPoints = activitiesText
//           .split("*")
//           .filter((item) => item.trim().length > 0);
//         if (bulletPoints.length > 0) {
//           activities["General"] = bulletPoints
//             .map((point) => point.trim())
//             .join(", ");
//         }
//       }
//     }

//     // Extract why 5 days or itinerary info
//     const whyMatch = block.match(/\*\*Why 5 Days:\*\*\s*([^*]+)/);
//     const itineraryMatch = block.match(
//       /\*\*5-Day Itinerary[^:]*:\*\*\s*([\s\S]+?)(?=\*\*|$)/
//     );

//     const why5Days = whyMatch ? whyMatch[1].trim() : "";
//     const itinerary = itineraryMatch ? itineraryMatch[1].trim() : "";

//     return {
//       id: index + 1,
//       name,
//       ...(category && { category }),
//       ...(focus && { focus }),
//       ...(description && { description }),
//       ...(coordinates && { coordinates }),
//       ...(Object.keys(activities).length > 0 && { activities }),
//       ...(why5Days && { why5Days }),
//       ...(itinerary && { itinerary }),
//     };
//   });

//   return destinations;
// }

// function parseUnstructuredDestinations(text) {
//   // Look for any sections that might contain location names and coordinates
//   const locations = [];

//   // Find patterns like "Location Name (lat: X, long: Y)"
//   const locPattern =
//     /([A-Za-z\s&]+)(?:\([^)]*\))?\s*(?::|-)?\s*(?:latitude|lat)?\.?\s*:?\s*(\d+\.\d+)°?\s*([NS])[,\s]+(?:longitude|long)?\.?\s*:?\s*(\d+\.\d+)°?\s*([EW])/gi;

//   let match;
//   while ((match = locPattern.exec(text)) !== null) {
//     const name = match[1].trim();
//     const latitude =
//       parseFloat(match[2]) * (match[3].toUpperCase() === "N" ? 1 : -1);
//     const longitude =
//       parseFloat(match[4]) * (match[5].toUpperCase() === "E" ? 1 : -1);

//     locations.push({
//       id: locations.length + 1,
//       name,
//       coordinates: {
//         latitude,
//         longitude,
//       },
//     });
//   }

//   return locations;
// }

function parseDestinations(text) {
  // Check for JSON array at the end of the text and remove it if present
  const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (jsonMatch) {
    text = text.replace(jsonMatch[0], "");
  }

  // Identify numbered destination patterns - note the improved regex
  const destinationBlocks = text.split(/\*\*\d+\.\s+/).slice(1);

  // If we couldn't find any numbered patterns, try another approach
  if (destinationBlocks.length === 0) {
    return parseUnstructuredDestinations(text);
  }

  const destinations = destinationBlocks.map((block, index) => {
    // Extract destination name - improved pattern to handle the format in document 4
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

    // Extract why 5 days or itinerary info
    const whyMatch = block.match(/\*\*Why 5 Days:\*\*\s*([^*]+)/);
    const itineraryMatch = block.match(
      /\*\*5-Day Itinerary[^:]*:\*\*\s*([\s\S]+?)(?=\*\*|$)/
    );

    const why5Days = whyMatch ? whyMatch[1].trim() : "";
    const itinerary = itineraryMatch ? itineraryMatch[1].trim() : "";

    return {
      id: index + 1,
      name,
      ...(category && { category }),
      ...(focus && { focus }),
      ...(description && { description }),
      ...(coordinates && { coordinates }),
      ...(Object.keys(activities).length > 0 && { activities }),
      ...(why5Days && { why5Days }),
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

    console.log("check 2");
    console.log(content);

    // Parse the destinations
    const destinations = parseDestinations(content);

    console.log(destinations);

    return destinations;
  } catch (error) {
    console.error("Error processing API response:", error);
    return [];
  }
}

