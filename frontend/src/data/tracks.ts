import { TrackInfo, TrackType } from '../types'

export const TRACKS: TrackInfo[] = [
  { id: 1, name: 'Bowman Gray Stadium', location: 'Winston Salem, NC', type: 'short_track', lengthMiles: 0.25 },
  { id: 2, name: 'Bristol Motor Speedway', location: 'Bristol, TN', type: 'short_track', lengthMiles: 0.533 },
  { id: 3, name: 'Charlotte Motor Speedway', location: 'Concord, NC', type: 'intermediate', lengthMiles: 1.5 },
  { id: 4, name: 'Charlotte Motor Speedway Roval', location: 'Concord, NC', type: 'road_course', lengthMiles: 2.32 },
  { id: 5, name: 'Chicagoland Speedway', location: 'Joliet, IL', type: 'intermediate', lengthMiles: 1.5 },
  { id: 6, name: 'Circuit of the Americas', location: 'Austin, TX', type: 'road_course', lengthMiles: 2.4 },
  { id: 7, name: 'Darlington Raceway', location: 'Darlington, SC', type: 'intermediate', lengthMiles: 1.366 },
  { id: 8, name: 'Daytona International Speedway', location: 'Daytona Beach, FL', type: 'superspeedway', lengthMiles: 2.5 },
  { id: 9, name: 'Dover Motor Speedway', location: 'Dover, DE', type: 'intermediate', lengthMiles: 1.0 },
  { id: 10, name: 'EchoPark Speedway', location: 'Hampton, GA', type: 'superspeedway', lengthMiles: 1.54 },
  { id: 11, name: 'Grand Prix of St. Petersburg', location: 'St. Petersburg, FL', type: 'road_course', lengthMiles: 1.8 },
  { id: 12, name: 'Homestead-Miami Speedway', location: 'Homestead, FL', type: 'intermediate', lengthMiles: 1.5 },
  { id: 13, name: 'Indianapolis Motor Speedway', location: 'Speedway, IN', type: 'intermediate', lengthMiles: 2.5 },
  { id: 14, name: 'Iowa Speedway', location: 'Newton, IA', type: 'short_track', lengthMiles: 0.875 },
  { id: 15, name: 'Kansas Speedway', location: 'Kansas City, KS', type: 'intermediate', lengthMiles: 1.5 },
  { id: 16, name: 'Las Vegas Motor Speedway', location: 'Las Vegas, NV', type: 'intermediate', lengthMiles: 1.5 },
  { id: 17, name: 'Lime Rock Park', location: 'Lakeville, CT', type: 'road_course', lengthMiles: 1.53 },
  { id: 18, name: 'Lucas Oil Indianapolis Raceway Park', location: 'Indianapolis, IN', type: 'short_track', lengthMiles: 0.686 },
  { id: 19, name: 'Martinsville Speedway', location: 'Ridgeway, VA', type: 'short_track', lengthMiles: 0.526 },
  { id: 20, name: 'Michelin Raceway Road Atlanta', location: 'Braselton, GA', type: 'road_course', lengthMiles: 2.54 },
  { id: 21, name: 'Michigan International Speedway', location: 'Brooklyn, MI', type: 'intermediate', lengthMiles: 2.0 },
  { id: 22, name: 'Nashville Superspeedway', location: 'Lebanon, TN', type: 'intermediate', lengthMiles: 1.333 },
  { id: 23, name: 'Naval Base Coronado', location: 'San Diego, CA', type: 'road_course', lengthMiles: 3.4 },
  { id: 24, name: 'New Hampshire Motor Speedway', location: 'Loudon, NH', type: 'intermediate', lengthMiles: 1.058 },
  { id: 25, name: 'North Wilkesboro Speedway', location: 'North Wilkesboro, NC', type: 'short_track', lengthMiles: 0.625 },
  { id: 26, name: 'Phoenix Raceway', location: 'Avondale, AZ', type: 'intermediate', lengthMiles: 1.0 },
  { id: 27, name: 'Pocono Raceway', location: 'Long Pond, PA', type: 'intermediate', lengthMiles: 2.5 },
  { id: 28, name: 'Richmond Raceway', location: 'Richmond, VA', type: 'short_track', lengthMiles: 0.75 },
  { id: 29, name: 'Rockingham Speedway', location: 'Rockingham, NC', type: 'intermediate', lengthMiles: 1.017 },
  { id: 30, name: 'Sebring International Raceway', location: 'Sebring, FL', type: 'road_course', lengthMiles: 3.74 },
  { id: 31, name: 'Sonoma Raceway', location: 'Sonoma, CA', type: 'road_course', lengthMiles: 1.99 },
  { id: 32, name: 'Talladega Superspeedway', location: 'Talladega, AL', type: 'superspeedway', lengthMiles: 2.66 },
  { id: 33, name: 'Texas Motor Speedway', location: 'Fort Worth, TX', type: 'intermediate', lengthMiles: 1.5 },
  { id: 34, name: 'Watkins Glen International', location: 'Watkins Glen, NY', type: 'road_course', lengthMiles: 2.45 },
  { id: 35, name: 'World Wide Technology Raceway', location: 'Madison, IL', type: 'intermediate', lengthMiles: 1.25 },
]

export function getTrack(name: string): TrackInfo | undefined {
  return TRACKS.find(t => t.name === name)
}

export function getTrackType(trackName: string): TrackType {
  return getTrack(trackName)?.type ?? 'intermediate'
}
