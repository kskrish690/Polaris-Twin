import {
  Component,
  signal
} from '@angular/core';

import {
  Router,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';

import {
  filter
} from 'rxjs/operators';

import { Navbar } from './navbar/navbar';
import { Home } from './home/home';
import { Footer } from './footer/footer';


@Component({

  selector: 'app-root',

  imports: [
    RouterOutlet,
    Navbar,
    Home,
    Footer
  ],

  templateUrl: './app.html',

  styleUrl: './app.css'

})


export class App {

  protected readonly title =
    signal('Polaris-Twin');


  constructor(
    private readonly router: Router
  ) {

    /*
     * Automatically move to the top
     * whenever a new Angular page loads.
     */

    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(() => {

        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });

      });

  }

}