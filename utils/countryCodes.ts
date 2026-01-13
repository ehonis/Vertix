// Common country codes with emoji flags
export interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
}

export const countryCodes: CountryCode[] = [
  { code: "US", dialCode: "+1", name: "United States", flag: "🇺🇸" },
  { code: "CA", dialCode: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "GB", dialCode: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", dialCode: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "DE", dialCode: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "FR", dialCode: "+33", name: "France", flag: "🇫🇷" },
  { code: "IT", dialCode: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "ES", dialCode: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "NL", dialCode: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", dialCode: "+32", name: "Belgium", flag: "🇧🇪" },
  { code: "CH", dialCode: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", dialCode: "+43", name: "Austria", flag: "🇦🇹" },
  { code: "SE", dialCode: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", dialCode: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "DK", dialCode: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", dialCode: "+358", name: "Finland", flag: "🇫🇮" },
  { code: "PL", dialCode: "+48", name: "Poland", flag: "🇵🇱" },
  { code: "IE", dialCode: "+353", name: "Ireland", flag: "🇮🇪" },
  { code: "PT", dialCode: "+351", name: "Portugal", flag: "🇵🇹" },
  { code: "GR", dialCode: "+30", name: "Greece", flag: "🇬🇷" },
  { code: "CZ", dialCode: "+420", name: "Czech Republic", flag: "🇨🇿" },
  { code: "HU", dialCode: "+36", name: "Hungary", flag: "🇭🇺" },
  { code: "RO", dialCode: "+40", name: "Romania", flag: "🇷🇴" },
  { code: "BG", dialCode: "+359", name: "Bulgaria", flag: "🇧🇬" },
  { code: "HR", dialCode: "+385", name: "Croatia", flag: "🇭🇷" },
  { code: "SK", dialCode: "+421", name: "Slovakia", flag: "🇸🇰" },
  { code: "SI", dialCode: "+386", name: "Slovenia", flag: "🇸🇮" },
  { code: "EE", dialCode: "+372", name: "Estonia", flag: "🇪🇪" },
  { code: "LV", dialCode: "+371", name: "Latvia", flag: "🇱🇻" },
  { code: "LT", dialCode: "+370", name: "Lithuania", flag: "🇱🇹" },
  { code: "JP", dialCode: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "KR", dialCode: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "CN", dialCode: "+86", name: "China", flag: "🇨🇳" },
  { code: "IN", dialCode: "+91", name: "India", flag: "🇮🇳" },
  { code: "SG", dialCode: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "MY", dialCode: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "TH", dialCode: "+66", name: "Thailand", flag: "🇹🇭" },
  { code: "PH", dialCode: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "ID", dialCode: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "VN", dialCode: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "NZ", dialCode: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "ZA", dialCode: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "BR", dialCode: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", dialCode: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "AR", dialCode: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", dialCode: "+56", name: "Chile", flag: "🇨🇱" },
  { code: "CO", dialCode: "+57", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", dialCode: "+51", name: "Peru", flag: "🇵🇪" },
  { code: "IL", dialCode: "+972", name: "Israel", flag: "🇮🇱" },
  { code: "AE", dialCode: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", dialCode: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "TR", dialCode: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "RU", dialCode: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "UA", dialCode: "+380", name: "Ukraine", flag: "🇺🇦" },
];

// Get country by dial code
export function getCountryByDialCode(dialCode: string): CountryCode | undefined {
  return countryCodes.find((country) => country.dialCode === dialCode);
}

// Get default country (US)
export function getDefaultCountry(): CountryCode {
  return countryCodes[0]; // US
}

