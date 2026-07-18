// ─── Shared player data ────────────────────────────────────────────────────────
// Single source of truth for all 24 FIFA 2026 star-player records.
// Imported by PlayersPage and PlayerComparePage.
// ──────────────────────────────────────────────────────────────────────────────
import type { Player } from '../types';

export const PLAYERS: Player[] = [
  {
    id: 'messi', name: 'Lionel Messi', number: 10, position: 'FWD',
    country: 'Argentina', countryCode: 'ARG', countryFlag: '🇦🇷', countryColor: '#74ACDF',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg/300px-Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
    age: 38,
    stats: { goals: 109, assists: 58, caps: 191, height: '1.70 m', preferredFoot: 'Left', club: 'Inter Miami CF', clubCountry: 'USA' },
  },
  {
    id: 'mbappe', name: 'Kylian Mbappé', number: 10, position: 'FWD',
    country: 'France', countryCode: 'FRA', countryFlag: '🇫🇷', countryColor: '#0055A4',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93162_%28cropped%2C_Mbapp%C3%A9%29.jpg/300px-2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93162_%28cropped%2C_Mbapp%C3%A9%29.jpg',
    age: 27,
    stats: { goals: 54, assists: 31, caps: 94, height: '1.78 m', preferredFoot: 'Right', club: 'Real Madrid', clubCountry: 'Spain' },
  },
  {
    id: 'ronaldo', name: 'Cristiano Ronaldo', number: 7, position: 'FWD',
    country: 'Portugal', countryCode: 'POR', countryFlag: '🇵🇹', countryColor: '#006600',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/300px-Cristiano_Ronaldo_2018.jpg',
    age: 41,
    stats: { goals: 137, assists: 44, caps: 219, height: '1.87 m', preferredFoot: 'Right', club: 'Al-Nassr', clubCountry: 'Saudi Arabia' },
  },
  {
    id: 'vinicius', name: 'Vinícius Jr', number: 20, position: 'FWD',
    country: 'Brazil', countryCode: 'BRA', countryFlag: '🇧🇷', countryColor: '#009C3B',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Vinicius_Junior_Vin%C3%ADcius_J%C3%BAnior_%28cropped%29.jpg/300px-Vinicius_Junior_Vin%C3%ADcius_J%C3%BAnior_%28cropped%29.jpg',
    age: 24,
    stats: { goals: 29, assists: 19, caps: 42, height: '1.76 m', preferredFoot: 'Right', club: 'Real Madrid', clubCountry: 'Spain' },
  },
  {
    id: 'bellingham', name: 'Jude Bellingham', number: 22, position: 'MID',
    country: 'England', countryCode: 'ENG', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', countryColor: '#CF0A0A',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Jude_Bellingham_%282022%29.jpg/300px-Jude_Bellingham_%282022%29.jpg',
    age: 22,
    stats: { goals: 18, assists: 11, caps: 46, height: '1.86 m', preferredFoot: 'Right', club: 'Real Madrid', clubCountry: 'Spain' },
  },
  {
    id: 'kane', name: 'Harry Kane', number: 9, position: 'FWD',
    country: 'England', countryCode: 'ENG', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', countryColor: '#CF0A0A',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Harry_Kane_England_v_France_%28cropped%29.jpg/300px-Harry_Kane_England_v_France_%28cropped%29.jpg',
    age: 32,
    stats: { goals: 75, assists: 22, caps: 98, height: '1.88 m', preferredFoot: 'Right', club: 'Bayern Munich', clubCountry: 'Germany' },
  },
  {
    id: 'saka', name: 'Bukayo Saka', number: 7, position: 'MID',
    country: 'England', countryCode: 'ENG', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', countryColor: '#CF0A0A',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Bukayo_Saka_2022_%28cropped%29.jpg/300px-Bukayo_Saka_2022_%28cropped%29.jpg',
    age: 23,
    stats: { goals: 28, assists: 21, caps: 49, height: '1.78 m', preferredFoot: 'Left', club: 'Arsenal', clubCountry: 'England' },
  },
  {
    id: 'foden', name: 'Phil Foden', number: 47, position: 'MID',
    country: 'England', countryCode: 'ENG', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', countryColor: '#CF0A0A',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Phil_Foden_2022_%28cropped%29.jpg/300px-Phil_Foden_2022_%28cropped%29.jpg',
    age: 26,
    stats: { goals: 19, assists: 14, caps: 41, height: '1.71 m', preferredFoot: 'Left', club: 'Manchester City', clubCountry: 'England' },
  },
  {
    id: 'rice', name: 'Declan Rice', number: 4, position: 'MID',
    country: 'England', countryCode: 'ENG', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', countryColor: '#CF0A0A',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Declan_Rice_2022_%28cropped%29.jpg/300px-Declan_Rice_2022_%28cropped%29.jpg',
    age: 26,
    stats: { goals: 9, assists: 7, caps: 52, height: '1.85 m', preferredFoot: 'Right', club: 'Arsenal', clubCountry: 'England' },
  },
  {
    id: 'yamal', name: 'Lamine Yamal', number: 19, position: 'FWD',
    country: 'Spain', countryCode: 'ESP', countryFlag: '🇪🇸', countryColor: '#AA151B',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Lamine_Yamal_2024_UEFA_Euro.jpg/300px-Lamine_Yamal_2024_UEFA_Euro.jpg',
    age: 18,
    stats: { goals: 12, assists: 16, caps: 33, height: '1.80 m', preferredFoot: 'Right', club: 'FC Barcelona', clubCountry: 'Spain' },
  },
  {
    id: 'pedri', name: 'Pedri', number: 16, position: 'MID',
    country: 'Spain', countryCode: 'ESP', countryFlag: '🇪🇸', countryColor: '#AA151B',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Pedro_Gonz%C3%A1lez_L%C3%B3pez_2021_%28cropped%29.jpg/300px-Pedro_Gonz%C3%A1lez_L%C3%B3pez_2021_%28cropped%29.jpg',
    age: 23,
    stats: { goals: 10, assists: 9, caps: 38, height: '1.74 m', preferredFoot: 'Left', club: 'FC Barcelona', clubCountry: 'Spain' },
  },
  {
    id: 'rodri', name: 'Rodri', number: 16, position: 'MID',
    country: 'Spain', countryCode: 'ESP', countryFlag: '🇪🇸', countryColor: '#AA151B',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Rodri_%28Rodrigo_Hern%C3%A1ndez_Cascante%29.jpg/300px-Rodri_%28Rodrigo_Hern%C3%A1ndez_Cascante%29.jpg',
    age: 29,
    stats: { goals: 13, assists: 17, caps: 62, height: '1.91 m', preferredFoot: 'Right', club: 'Manchester City', clubCountry: 'England' },
  },
  {
    id: 'griezmann', name: 'Antoine Griezmann', number: 7, position: 'FWD',
    country: 'France', countryCode: 'FRA', countryFlag: '🇫🇷', countryColor: '#0055A4',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Antoine_Griezmann_2018_WC_%28cropped%29.jpg/300px-Antoine_Griezmann_2018_WC_%28cropped%29.jpg',
    age: 35,
    stats: { goals: 52, assists: 39, caps: 138, height: '1.76 m', preferredFoot: 'Left', club: 'Atlético de Madrid', clubCountry: 'Spain' },
  },
  {
    id: 'musiala', name: 'Jamal Musiala', number: 14, position: 'MID',
    country: 'Germany', countryCode: 'GER', countryFlag: '🇩🇪', countryColor: '#FFCC00',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Jamal_Musiala_2022_%28cropped%29.jpg/300px-Jamal_Musiala_2022_%28cropped%29.jpg',
    age: 22,
    stats: { goals: 17, assists: 15, caps: 44, height: '1.80 m', preferredFoot: 'Right', club: 'Bayern Munich', clubCountry: 'Germany' },
  },
  {
    id: 'kimmich', name: 'Joshua Kimmich', number: 6, position: 'MID',
    country: 'Germany', countryCode: 'GER', countryFlag: '🇩🇪', countryColor: '#FFCC00',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Joshua_Kimmich_2022_%28cropped%29.jpg/300px-Joshua_Kimmich_2022_%28cropped%29.jpg',
    age: 31,
    stats: { goals: 14, assists: 25, caps: 78, height: '1.77 m', preferredFoot: 'Right', club: 'Bayern Munich', clubCountry: 'Germany' },
  },
  {
    id: 'davies', name: 'Alphonso Davies', number: 19, position: 'DEF',
    country: 'Canada', countryCode: 'CAN', countryFlag: '🇨🇦', countryColor: '#FF0000',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Alphonso_Davies_2022_%28cropped%29.jpg/300px-Alphonso_Davies_2022_%28cropped%29.jpg',
    age: 25,
    stats: { goals: 16, assists: 10, caps: 60, height: '1.80 m', preferredFoot: 'Left', club: 'Real Madrid', clubCountry: 'Spain' },
  },
  {
    id: 'pulisic', name: 'Christian Pulisic', number: 10, position: 'MID',
    country: 'USA', countryCode: 'USA', countryFlag: '🇺🇸', countryColor: '#002868',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Christian_Pulisic_2022_%28cropped%29.jpg/300px-Christian_Pulisic_2022_%28cropped%29.jpg',
    age: 27,
    stats: { goals: 32, assists: 18, caps: 68, height: '1.77 m', preferredFoot: 'Left', club: 'AC Milan', clubCountry: 'Italy' },
  },
  {
    id: 'lozano', name: 'Hirving Lozano', number: 22, position: 'FWD',
    country: 'Mexico', countryCode: 'MEX', countryFlag: '🇲🇽', countryColor: '#006847',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Hirving_Lozano_2022_%28cropped%29.jpg/300px-Hirving_Lozano_2022_%28cropped%29.jpg',
    age: 30,
    stats: { goals: 33, assists: 16, caps: 80, height: '1.74 m', preferredFoot: 'Left', club: 'PSV Eindhoven', clubCountry: 'Netherlands' },
  },
  {
    id: 'valverde', name: 'Federico Valverde', number: 8, position: 'MID',
    country: 'Uruguay', countryCode: 'URU', countryFlag: '🇺🇾', countryColor: '#5EB6E4',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Federico_Valverde_2022_%28cropped%29.jpg/300px-Federico_Valverde_2022_%28cropped%29.jpg',
    age: 26,
    stats: { goals: 15, assists: 13, caps: 58, height: '1.82 m', preferredFoot: 'Right', club: 'Real Madrid', clubCountry: 'Spain' },
  },
  {
    id: 'courtois', name: 'Thibaut Courtois', number: 1, position: 'GK',
    country: 'Belgium', countryCode: 'BEL', countryFlag: '🇧🇪', countryColor: '#ED2939',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Thibaut_Courtois_2019_%28cropped%29.jpg/300px-Thibaut_Courtois_2019_%28cropped%29.jpg',
    age: 33,
    stats: { goals: 0, assists: 0, caps: 104, height: '1.99 m', preferredFoot: 'Left', club: 'Real Madrid', clubCountry: 'Spain' },
  },
  {
    id: 'donnarumma', name: 'Gianluigi Donnarumma', number: 1, position: 'GK',
    country: 'Italy', countryCode: 'ITA', countryFlag: '🇮🇹', countryColor: '#009246',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Gianluigi_Donnarumma_Euro_2020_%28cropped%29.jpg/300px-Gianluigi_Donnarumma_Euro_2020_%28cropped%29.jpg',
    age: 26,
    stats: { goals: 0, assists: 0, caps: 78, height: '1.96 m', preferredFoot: 'Right', club: 'Paris Saint-Germain', clubCountry: 'France' },
  },
  {
    id: 'richarlison', name: 'Richarlison', number: 9, position: 'FWD',
    country: 'Brazil', countryCode: 'BRA', countryFlag: '🇧🇷', countryColor: '#009C3B',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Richarlison_2022_%28cropped%29.jpg/300px-Richarlison_2022_%28cropped%29.jpg',
    age: 28,
    stats: { goals: 27, assists: 11, caps: 58, height: '1.84 m', preferredFoot: 'Right', club: 'Tottenham Hotspur', clubCountry: 'England' },
  },
  {
    id: 'raphinha', name: 'Raphinha', number: 11, position: 'FWD',
    country: 'Brazil', countryCode: 'BRA', countryFlag: '🇧🇷', countryColor: '#009C3B',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Raphinha_2022_%28cropped%29.jpg/300px-Raphinha_2022_%28cropped%29.jpg',
    age: 29,
    stats: { goals: 31, assists: 16, caps: 57, height: '1.76 m', preferredFoot: 'Left', club: 'FC Barcelona', clubCountry: 'Spain' },
  },
  {
    id: 'neymar', name: 'Neymar Jr', number: 10, position: 'FWD',
    country: 'Brazil', countryCode: 'BRA', countryFlag: '🇧🇷', countryColor: '#009C3B',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Neymar_vs_Croatia_2018.jpg/300px-Neymar_vs_Croatia_2018.jpg',
    age: 34,
    stats: { goals: 82, assists: 57, caps: 132, height: '1.75 m', preferredFoot: 'Right', club: 'Santos FC', clubCountry: 'Brazil' },
  },
];

/** Max values across all players — used for radar chart normalisation. */
export const PLAYER_MAXES = {
  goals:   Math.max(...PLAYERS.map(p => p.stats.goals)),
  assists: Math.max(...PLAYERS.map(p => p.stats.assists)),
  caps:    Math.max(...PLAYERS.map(p => p.stats.caps)),
};
