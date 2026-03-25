import { TrackInfo, TrackType } from '../types'

export const TRACKS: TrackInfo[] = [
  { id: 1, name: 'Daytona International Speedway', type: 'superspeedway', lengthMiles: 2.5, banking: '31°' },
  { id: 2, name: 'Las Vegas Motor Speedway', type: 'intermediate', lengthMiles: 1.5, banking: '20°' },
  { id: 3, name: 'Phoenix Raceway', type: 'intermediate', lengthMiles: 1.0, banking: '11°' },
  { id: 4, name: 'Atlanta Motor Speedway', type: 'superspeedway', lengthMiles: 1.54, banking: '24°' },
  { id: 5, name: 'Bristol Motor Speedway', type: 'short_track', lengthMiles: 0.533, banking: '26°' },
  { id: 6, name: 'Charlotte Motor Speedway', type: 'intermediate', lengthMiles: 1.5, banking: '24°' },
  { id: 7, name: 'Richmond Raceway', type: 'short_track', lengthMiles: 0.75, banking: '14°' },
  { id: 8, name: 'Martinsville Speedway', type: 'short_track', lengthMiles: 0.526, banking: '12°' },
  { id: 9, name: 'Kansas Speedway', type: 'intermediate', lengthMiles: 1.5, banking: '15°' },
  { id: 10, name: 'Michigan International Speedway', type: 'intermediate', lengthMiles: 2.0, banking: '18°' },
  { id: 11, name: 'Talladega Superspeedway', type: 'superspeedway', lengthMiles: 2.66, banking: '33°' },
  { id: 12, name: 'Nashville Superspeedway', type: 'intermediate', lengthMiles: 1.33, banking: '14°' },
  { id: 13, name: 'Chicago Street Circuit', type: 'street', lengthMiles: 2.2, banking: '0°' },
  { id: 14, name: 'Road America', type: 'road_course', lengthMiles: 4.048, banking: '0°' },
  { id: 15, name: 'New Hampshire Motor Speedway', type: 'short_track', lengthMiles: 1.058, banking: '12°' },
  { id: 16, name: 'Indianapolis Motor Speedway', type: 'road_course', lengthMiles: 2.439, banking: '9°' },
  { id: 17, name: 'Pocono Raceway', type: 'intermediate', lengthMiles: 2.5, banking: '14°' },
  { id: 18, name: 'Watkins Glen International', type: 'road_course', lengthMiles: 2.45, banking: '0°' },
  { id: 19, name: 'Darlington Raceway', type: 'intermediate', lengthMiles: 1.366, banking: '25°' },
  { id: 20, name: 'Texas Motor Speedway', type: 'intermediate', lengthMiles: 1.5, banking: '24°' },
  { id: 21, name: 'Sonoma Raceway', type: 'road_course', lengthMiles: 1.99, banking: '0°' },
  { id: 22, name: 'Homestead-Miami Speedway', type: 'intermediate', lengthMiles: 1.5, banking: '20°' },
  { id: 23, name: 'Dover Motor Speedway', type: 'intermediate', lengthMiles: 1.0, banking: '24°' },
  { id: 24, name: 'Auto Club Speedway', type: 'intermediate', lengthMiles: 2.0, banking: '14°' },
  { id: 25, name: 'Iowa Speedway', type: 'short_track', lengthMiles: 0.875, banking: '12°' },
  { id: 26, name: 'Portland International Raceway', type: 'road_course', lengthMiles: 1.967, banking: '0°' },
  { id: 27, name: 'WWT Raceway', type: 'intermediate', lengthMiles: 1.25, banking: '12°' },
  { id: 28, name: 'Circuit of the Americas', type: 'road_course', lengthMiles: 3.426, banking: '0°' },
  { id: 29, name: 'North Wilkesboro Speedway', type: 'short_track', lengthMiles: 0.625, banking: '14°' },
  { id: 30, name: 'Rockingham Speedway', type: 'intermediate', lengthMiles: 1.017, banking: '22°' },
]

export function getTrack(name: string): TrackInfo | undefined {
  return TRACKS.find(t => t.name === name)
}

export function getTrackType(trackName: string): TrackType {
  return getTrack(trackName)?.type ?? 'intermediate'
}
