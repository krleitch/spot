import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// env
import { environment } from 'src/environments/environment';

// services
import { AlertService } from '@services/alert.service';

// assets
import {
  GetSpotActivityRequest,
  GetSpotActivityResponse,
  CreateSpotRequest,
  CreateSpotResponse,
  DeleteSpotRequest,
  DeleteSpotResponse,
  RateSpotRequest,
  RateSpotResponse,
  GetSpotRequest,
  GetSpotResponse,
  GetSingleSpotRequest,
  GetSingleSpotResponse,
  ReportSpotRequest,
  ReportSpotResponse,
  DeleteRatingRequest,
  DeleteRatingResponse
} from '@models/../newModels/spot';
import { SpotError } from '@exceptions/error';

@Injectable({
  providedIn: 'root'
})
export class SpotService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private alertService: AlertService) {}

  getSpots(request: GetSpotRequest): Observable<GetSpotResponse> {
    let params = new HttpParams();
    if (request.location) {
      params = params.append('latitude', request.location.latitude.toString());
      params = params.append(
        'longitude',
        request.location.longitude.toString()
      );
    }
    params = params.append('locationType', request.options.locationType);
    params = params.append('searchType', request.options.searchType);
    params = params.append('limit', request.limit.toString());
    if (request.before) {
      params = params.append('before', request.before);
    }
    if (request.after) {
      params = params.append('after', request.after);
    }
    return this.http.get<GetSpotResponse>(`${this.baseUrl}/spot`, { params });
  }

  getSingleSpot(
    request: GetSingleSpotRequest
  ): Observable<GetSingleSpotResponse> {
    let params = new HttpParams();
    if (request.location) {
      params = params.append('latitude', request.location.latitude.toString());
      params = params.append(
        'longitude',
        request.location.longitude.toString()
      );
    }
    return this.http.get<GetSingleSpotResponse>(
      `${this.baseUrl}/spot/${request.spotLink}`,
      { params }
    );
  }

  createSpot(request: CreateSpotRequest): Observable<CreateSpotResponse> {
    const formData = new FormData();
    formData.append('json', JSON.stringify(request));
    console.log(JSON.stringify(request));

    if (request.image) {
      formData.append('image', request.image);
    }
    return this.http.post<CreateSpotResponse>(`${this.baseUrl}/spot`, formData);
  }

  deleteSpot(request: DeleteSpotRequest): Observable<DeleteSpotResponse> {
    return this.http.delete<DeleteSpotResponse>(
      `${this.baseUrl}/spot/${request.spotId}`
    );
  }

  reportSpot(request: ReportSpotRequest): Observable<ReportSpotResponse> {
    return this.http.put<ReportSpotResponse>(
      `${this.baseUrl}/spot/${request.spotId}/report`,
      request
    );
  }

  deleteSpotRating(
    request: DeleteRatingRequest
  ): Observable<DeleteRatingResponse> {
    return this.http.delete<DeleteRatingResponse>(
      `${this.baseUrl}/spot/${request.spotId}/rating`
    );
  }

  getSpotActivity(
    request: GetSpotActivityRequest
  ): Observable<GetSpotActivityResponse> {
    let params = new HttpParams();
    if (request.before) {
      params = params.append('before', request.before.toString());
    }
    if (request.after) {
      params = params.append('after', request.after.toString());
    }
    params = params.append('limit', request.limit.toString());
    if (request.location) {
      params = params.append('latitude', request.location.latitude.toString());
      params = params.append(
        'longitude',
        request.location.longitude.toString()
      );
    }
    return this.http.get<GetSpotActivityResponse>(
      `${this.baseUrl}/spot/activity`,
      { params }
    );
  }

  rateSpot(request: RateSpotRequest): Observable<RateSpotResponse> {
    return this.http.post<RateSpotResponse>(
      `${this.baseUrl}/spot/${request.spotId}/rating/${request.rating}`,
      request
    );
  }

  failureMessage(error: string): void {
    this.alertService.error(error);
  }
}
