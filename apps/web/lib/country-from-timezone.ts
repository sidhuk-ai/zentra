import { getCountry, getTimezone } from "countries-and-timezones"

export const getCountryFromTimezone = (timezone?: string) => {
    if(!timezone) return null;
    const data = getTimezone(timezone);
    if(!data?.countries.length) return null;

    const countryCode = data.countries[0];
    const country = getCountry(countryCode as string);

    return {
        code: countryCode,
        name: country?.name || countryCode
    }
}

export const getCountryFlag = (countryCode:string) => {
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}