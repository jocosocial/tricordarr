/**
 * Ship codes used by the map-extractor tool and served by Swiftarr at
 * /public/ship/<code>/. This mapping is currently hardcoded client-side;
 * it should eventually come from the server via /client/settings, the same
 * way cruiseStartDate and portTimeZoneID do.
 */
export enum ShipCode {
  halEd = 'hal-ed',
  halKo = 'hal-ko',
  halNa = 'hal-na',
}

export namespace ShipCode {
  export const getLabel = (code?: ShipCode): string => {
    switch (code) {
      case ShipCode.halEd:
        return 'Eurodam';
      case ShipCode.halKo:
        return 'Koningsdam';
      case ShipCode.halNa:
        return 'Nieuw Amsterdam';
      default:
        return 'Unknown';
    }
  };

  export const all: ShipCode[] = [ShipCode.halEd, ShipCode.halKo, ShipCode.halNa];
}
