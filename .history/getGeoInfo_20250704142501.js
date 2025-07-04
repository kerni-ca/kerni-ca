export async function getGeoInfo(ip) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`);
    const data = await res.json();
    if (data.status === 'success') {
      return data; // { country, regionName, city }
    }
    return null;
  } catch {
    return null;
  }
} 