// 1. Varmista että URL on tämä (Helsinki region v2)
const HSL_API_URL = 'https://api.digitransit.fi/routing/v2/hsl/gtfs/v1';

// 2. Liitä kopioimasi koodi tähän heittomerkkien väliin
const API_KEY = '72809238b50e4cf0a7bd0f6c7416fba8';

export const fetchHslAlerts = async () => {
  const query = `
    {
      alerts {
        alertHeaderText
        alertDescriptionText
        alertSeverityLevel
        route {
          shortName
        }
      }
    }
  `;

  try {
    const response = await fetch(HSL_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'digitransit-subscription-key': API_KEY 
      },
      body: JSON.stringify({ query }),
    });

    const json = await response.json();
    return json.data.alerts || [];
  } catch (error) {
    console.error("Haku epäonnistui:", error);
    return [];
  }
};