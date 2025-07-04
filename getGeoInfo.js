export async function getGeoInfo(ip) {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    if (data.country_name) {
      return {
        country: data.country_name,
        regionName: data.region || data.state || '',
        city: data.city || ''
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting geo info:', error);
    return null;
  }
} 