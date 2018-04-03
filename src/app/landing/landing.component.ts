import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  tiles = [
    {
      imgUrl: "img/paragliding.png",
      imgAlt: "Photo of a paragliding mascot",
      title: "Map for paragliding pilots",
      subTitle: "",
      naviString: "paragliding",
      backgroundUrl: "img/background/paragliding.png"
    },
    {
      imgUrl: "img/walking.png",
      imgAlt: "Photo of a walking mascot",
      title: "Temperature map for tourists",
      subTitle: "",
      naviString: "tourist",
      backgroundUrl: "img/background/outdoors.png"
    },
    {
      imgUrl: "img/triathlon.png",
      imgAlt: "Photo of a triathloning mascot",
      title: "Map for everyone",
      subTitle: "",
      naviString: "outdoors",
      backgroundUrl: "img/background/everyone.png"
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
  }

  navigate(target) {
    this.router.navigate([target])
  }

}
