import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigator'
})
export class NavigatorComponent {
  tiles = [
    {
      imgUrl: "/img/paragliding.png",
      imgAlt: "Photo of a paragliding mascot",
      title: "Paragliding map",
      subTitle: "",
      naviString: "paragliding",
      backgroundUrl: "/img/background/paragliding.png"
    },
    {
      imgUrl: "/img/walking.png",
      imgAlt: "Photo of a walking mascot",
      title: "Tourist map",
      subTitle: "",
      naviString: "tourist",
      backgroundUrl: "/img/background/outdoors.png"
    },
    {
      imgUrl: "/img/triathlon.png",
      imgAlt: "Photo of a triathloning mascot",
      title: "Map for everyone",
      subTitle: "",
      naviString: "outdoors",
      backgroundUrl: "/img/background/everyone.png"
    }
  ];

  constructor(public router: Router) { }

  navigate(target) {
    this.router.navigate([target])
  }

}
