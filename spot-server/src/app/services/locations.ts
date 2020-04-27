export { verifyLocation }

const locations = require('../db/locations');

// Returns True if the location given is accurate for the user with account_id
function verifyLocation( account_id: string, myLatitude: number, myLongitude: number ): boolean {

    return locations.getLatestLocation(account_id).then( (location: any) => {

        // 40 mph is allowed rate of change of location
        const MAX_DISTANCE_CHANGE = 40;

        // Max time is 1 day
        const MAX_TIME_CHANGE = 24;

        const { latitude, longitude, creation_date } = location[0];

        // The max time delay has passed
        if ( new Date().valueOf() >= new Date( new Date(creation_date).valueOf() + MAX_TIME_CHANGE * 3600000).valueOf() ) {
            return true;
        } else {

            const numHours = ( new Date().valueOf() - new Date(creation_date).valueOf() ) / 3600000;

            const maxDistance = MAX_DISTANCE_CHANGE * numHours;

            return distanceBetween( myLatitude, myLongitude, latitude, longitude, 'M' ) <= maxDistance;

        }

    });

}


function distanceBetween(lat1: number, lon1: number, lat2: number, lon2: number, unit: string) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}
