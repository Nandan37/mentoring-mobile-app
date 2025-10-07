import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { UtilService } from '../services';


@Injectable({
  providedIn: 'root'
})
export class PrivateGuard implements CanActivate {
  constructor(private userService:UserService,private router: Router, private utilService: UtilService){}
 async canActivate(): Promise<boolean> {
    try {
      const token = await this.userService.getUserValue();
      if (token) {
        this.utilService?.alertClose();
        return true;
      }
      location.href = window.location.origin;
      return false;
    } catch (err) {
      location.href = window.location.origin;
      return false;
    }
  }
  
}
