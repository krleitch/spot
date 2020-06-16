export { checkLocation, verifyLocation, distanceBetween, getGeolocation }

const request = require('request');

const googleconfig = require('../../../googlekey.json');

const locations = require('../db/locations');

// Returns if  you are allowed to commnet/post on something
// TODO
const checkLocation = (req: any, res: any, next: any) => {



	next();
}


// Returns True if the location given is accurate for the user with account_id
function verifyLocation( account_id: string, myLatitude: number, myLongitude: number ): Promise<boolean> {

    return locations.getLatestLocation(account_id).then( (location: any) => {

        // 40 mph is allowed rate of change of location
        const MAX_DISTANCE_CHANGE = 80;

        // Max time is 1 day
        const MAX_TIME_CHANGE = 24;

		// No previous info
		if ( location.length < 1 ) {
			return true;
		}

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

function distanceBetween(lat1: number, lon1: number, lat2: number, lon2: number, unit: string): number {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1 / 180;
		var radlat2 = Math.PI * lat2 / 180;
		var theta = lon1 - lon2;
		var radtheta = Math.PI * theta / 180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180 / Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344; }
		if (unit=="N") { dist = dist * 0.8684; }
		return dist;
	}
}


function getGeolocation( latitude: string, longitude: string ): Promise<string> {

	// In order the most preferred location type
	const typeRanks = [
		'point_of_interest',
		'university',
		'premise',
		'neighborhood',
		'locality',
		'country'
	];

	// 10 characters
	const max_name_length = 10;

	const baseUrl = "https://maps.googleapis.com/maps/api/geocode/json?";
	const latlng = "latlng=" + parseFloat(latitude) + "," + parseFloat(longitude);
	let filter = "&result_type=";

	typeRanks.forEach( (type: string, index: number) => {
		filter += type
		if ( index !== typeRanks.length - 1 ) {
			filter += '|'
		}
	})

	const key = "&key=" + googleconfig.APIKey;

	const url = baseUrl + latlng + filter + key;

	// we don't want to give away street address
	return new Promise((resolve, reject) => {

		// TODO: REMOVE
		// Also remove the ellipsis, make that frontend

		return resolve('TEST');

		request(url, ( error: any, response: any, body: any ) => {

			if ( error ) {
				return reject(error);
			}

			const res = JSON.parse(body);

			// No place
			if ( res.results.length === 0 ) {
				return resolve('');
			}

			// TODO: can make better?
			typeRanks.forEach( (type: string) => {
				res.results.forEach( (place: any) => {

					// Use this place

					if ( place.address_components.length === 0 ) {
						return resolve('')
					}

					if ( place.types.includes(type) ) {

						typeRanks.forEach( (typeAddress: string) => {
							place.address_components.forEach( (address: any) => {

								// use this address

								if ( address.types.includes(typeAddress) ) {
									if ( address.long_name.length < max_name_length ) {
										return resolve(address.long_name);
									} else {
	
										if ( address.long_name.length < max_name_length ) {
											return resolve(address.short_name)
										} else {
											return resolve(address.short_name.substring(0, max_name_length - 3) + '...')
										}
	
									}
								}
								
							});
						})

					}
				})
	
			})

			return resolve('');

		});
	});

}
