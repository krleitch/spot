export { checkLocation, verifyLocation, distanceBetween, getGeolocation, addDistanceToRows };

const request = require('request');

// config
const googleconfig = require('@config/googlekey.json');

// db
const locations = require('@db/locations');
const redisClient = require('@db/redis');

// error
const LocationsError = require('@exceptions/locations');

// constants
const locations_constants = require('@constants/locations');
const LOCATIONS_CONSTANTS = locations_constants.LOCATIONS_CONSTANTS;

// Middleware to call verifyLocation
const checkLocation = async (req: any, res: any, next: any) => {

	// if you aren't logged in then verifying your location doesn't matter
	if ( !req.authenticated ) {
		return next();
	}

	const accountId = req.user.id;

	// For get requests

	let latitude: any = null;
	let longitude: any = null;

	// for get requests
	if ( req.query ) {
		latitude = Number(req.query.latitude);
		longitude = Number(req.query.longitude);
	}

	// for post requests
	const { location } = req.body;

	if ( location ) {
		latitude = location.latitude;
		longitude = location.longitude;
	}

	// If there is a location attached to the request, compare to last location
	if ( latitude && longitude ) {

		await verifyLocation( accountId, latitude, longitude ).then( (valid: boolean) => {
			if ( !valid ) {
				return next(new LocationsError.LocationError(500));
			} else {
				// We have a new valid location, update it
				locations.updateLocation(accountId, latitude, longitude).then( (rows: any) => {
					return next();
				}, (err: any) => {
					return next();
				});
			}
		});

	} else {
		// No location info, so just go next
		return next();
	}

}

// Returns True if the location given is accurate for the user with account_id
function verifyLocation( account_id: string, myLatitude: number, myLongitude: number ): Promise<boolean> {

    return locations.getLatestLocation(account_id).then( (location: any) => {

		// No previous info, so add it and return true
		if ( location.length < 1 ) {

			return locations.addLocation(account_id, myLatitude, myLongitude).then( (rows: any) => {
				return true;
			}, (err: any) => {

			});

		} else {

			const { latitude, longitude, creation_date } = location[0];

			// The max time delay has passed
			if ( new Date().valueOf() >= new Date( new Date(creation_date).valueOf() + LOCATIONS_CONSTANTS.MAX_TIME_CHANGE * 3600000).valueOf() ) {
				return true;
			} else {
	
				const numHours = ( new Date().valueOf() - new Date(creation_date).valueOf() ) / 3600000;
	
				const maxDistance = LOCATIONS_CONSTANTS.MAX_DISTANCE_CHANGE * numHours;
				
				// TODO: fix Math.max(1) to be a constant
				return distanceBetween( myLatitude, myLongitude, latitude, longitude, 'M' ) <= Math.max(1, maxDistance);
	
			}

		}

    }, (err: any) => {
		return true;
	});

}

function addDistanceToRows(rows: any[], latitude: number, longitude: number, hideDistance: boolean): any[] {
	return rows.map( (row: any) => {
		let newRow = row
		if ( latitude && longitude ) {
			const distance = distanceBetween( latitude, longitude, row.latitude, row.longitude, 'M' );
			newRow.distance = hideDistance ? Math.max(LOCATIONS_CONSTANTS.MIN_DISTANCE, distance) : distance;
			newRow.inRange = newRow.distance <= 10;
		} else {
			newRow.inRange = false;
		}
		delete newRow.latitude;
		delete newRow.longitude;
		return newRow;
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
	return new Promise(async (resolve, reject) => {

		// check redis cache first
		await redisClient.georadius('geocodes', longitude, latitude, '25', 'm', 'WITHCOORD', 'WITHDIST', 'ASC', async (err: any, results: any[]) => {

			if ( results.length > 0 ) {

				// check if the entry needs to be removed from cache due to time expires
				
				const locationName = results[0][0];

				await redisClient.zscore('geocodes_expires', locationName, async (err: any, expiresTimestamp: any) => {

					if ( expiresTimestamp >= new Date().getTime() ) {

						await redisClient.zrem('geocodes_expires', locationName);
						await redisClient.zrem('geocodes', locationName);

					} else {
						return resolve(locationName);
					}

				});

			}

		});

		request(url, ( error: any, response: any, body: any ) => {

			if ( error ) {
				return reject(error);
			}

			const res = JSON.parse(body);

			// No place
			if ( res.results.length === 0 ) {
				return resolve('');
			}

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
								const date = new Date();
								const geocodeExpiresIn = 7 // days
								date.setDate(date.getDate() + geocodeExpiresIn);
								const expireTimestamp = date.getTime();

								if ( address.types.includes(typeAddress) ) {
									if ( address.long_name.length < max_name_length ) {
										redisClient.zadd('geocodes_expires', expireTimestamp, address.long_name);
										redisClient.geoadd('geocodes', longitude, latitude, address.long_name);
										return resolve(address.long_name);
									} else {
										redisClient.zadd('geocodes_expires', expireTimestamp, address.short_name);
										redisClient.geoadd('geocodes', longitude, latitude, address.short_name);
										return resolve(address.short_name)
									}
								}
								
							});
						});

					}
				});
	
			});

			return resolve('');

		});
	});

}
