export interface Coordinates {
  lat: number;
  lng: number;
}

export class GeoService {
  /**
   * Calculate distance between two lat/lng coordinates in meters using the Haversine formula
   */
  public static haversineDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371e3; // Earth's radius in metres
    const φ1 = (coord1.lat * Math.PI) / 180;
    const φ2 = (coord2.lat * Math.PI) / 180;
    const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
    const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Distance from a point P to a line segment AB in meters
   */
  public static distanceToSegmentMeters(p: Coordinates, a: Coordinates, b: Coordinates): number {
    const l2 = Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2);
    if (l2 === 0) return this.haversineDistanceMeters(p, a);

    // Consider the line extending the segment, parameterized as a + t (b - a).
    // We find projection of point p onto the line.
    let t = ((p.lat - a.lat) * (b.lat - a.lat) + (p.lng - a.lng) * (b.lng - a.lng)) / l2;
    t = Math.max(0, Math.min(1, t));

    const projection: Coordinates = {
      lat: a.lat + t * (b.lat - a.lat),
      lng: a.lng + t * (b.lng - a.lng),
    };

    return this.haversineDistanceMeters(p, projection);
  }

  /**
   * Detect whether current coordinate deviates from planned route polyline
   */
  public static checkRouteDeviation(
    currentCoord: Coordinates,
    routePolyline: Coordinates[],
    thresholdMeters: number = 300
  ): { isDeviated: boolean; distanceMeters: number } {
    if (!routePolyline || routePolyline.length < 2) {
      return { isDeviated: false, distanceMeters: 0 };
    }

    let minDistance = Infinity;

    for (let i = 0; i < routePolyline.length - 1; i++) {
      const segDistance = this.distanceToSegmentMeters(
        currentCoord,
        routePolyline[i],
        routePolyline[i + 1]
      );
      if (segDistance < minDistance) {
        minDistance = segDistance;
      }
    }

    return {
      isDeviated: minDistance > thresholdMeters,
      distanceMeters: Math.round(minDistance),
    };
  }
}
