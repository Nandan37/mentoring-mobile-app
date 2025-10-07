import { Injectable } from '@angular/core';
import { localKeys } from '../../constants/localStorage.keys';
import { LocalStorageService } from '../localstorage.service';
import * as _ from 'lodash-es';
import jwt_decode from "jwt-decode";
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  token;
  baseUrl:any;
  userEvent = new Subject<any>();
  userEventEmitted$ = this.userEvent.asObservable();
  constructor(

    ) {}
  async getUserValue(): Promise<string | null> {
    try {
    const data = localStorage.getItem('accToken'); 
    this.token = data;
    if (!this.validateToken(data)) { 
    return null;
    }

    this.token = data;
    return data;
    } catch (error) {
      return null;
    }
  }


  validateToken(token: string): boolean {
  try {
    const decoded: any = jwt_decode(token);
    const expiry = new Date(decoded.exp * 1000);
    return new Date() < expiry;
  } catch (err) {
    return false;
  }
}
}
