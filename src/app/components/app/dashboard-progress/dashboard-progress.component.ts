import {Component, ElementRef, OnInit} from '@angular/core';

@Component({
  selector: 'app-dashboard-progress',
  templateUrl: './dashboard-progress.component.html',
  styleUrls: ['./dashboard-progress.component.scss']
})
export class DashboardProgressComponent implements OnInit {
  chartData: any;
  view: number[];
  timer: number;
  hidden: any;

  constructor(private element: ElementRef) { }

  onResize(event) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.hidden = true;
      setTimeout(() => {
        this.calculateView();
        this.hidden = false;
      }, 150);
    }, 500);
  }

  calculateView() {
    const bound = this.element.nativeElement.parentNode.getBoundingClientRect();
    let width = bound.width - 50;
    if (width < 300) { width = 300; }
    this.view = [width, 200];
  }

  ngOnInit() {
    this.calculateView();

    const data = [
      {
        name: '1 دی',
        series: [
          {
            name: 'A',
            value: 100
          },
          {
            name: 'B',
            value: 70
          },
          {
            name: 'C',
            value: 20
          }
        ]
      },
      {
        name: '2 دی',
        series: [
          {
            name: 'A',
            value: 100
          },
          {
            name: 'B',
            value: 70
          },
          {
            name: 'C',
            value: 20
          }
        ]
      },
      {
        name: '3 دی',
        series: [
          {
            name: 'A',
            value: 100
          },
          {
            name: 'B',
            value: 70
          },
          {
            name: 'C',
            value: 20
          }
        ]
      },
      {
        name: '4 دی',
        series: [
          {
            name: 'A',
            value: 100
          },
          {
            name: 'B',
            value: 70
          },
          {
            name: 'C',
            value: 20
          }
        ]
      },
      {
        name: '5 دی',
        series: [
          {
            name: 'A',
            value: 100
          },
          {
            name: 'B',
            value: 70
          },
          {
            name: 'C',
            value: 20
          }
        ]
      },
      {
        name: '6 دی',
        series: [
          {
            name: 'A',
            value: 100
          },
          {
            name: 'B',
            value: 70
          },
          {
            name: 'C',
            value: 20
          }
        ]
      },
      {
        name: '7 دی',
        series: [
          {
            name: 'A',
            value: 100
          },
          {
            name: 'B',
            value: 70
          },
          {
            name: 'C',
            value: 20
          }
        ]
      }
    ];

    this.chartData = data;
  }

}
