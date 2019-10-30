import { Component, OnInit, ViewChild } from '@angular/core';

const SIZE = 50;
const NB_ISLANDS = 5;
const ISLAND_WIDTH = 3;

enum AreaStatus {
  Sea = 0,
  Land = 1,
  Discovered = 2,
}

const SEA_COLOR = '#cbe1ff';
const LAND_COLOR = '#bbbbbb';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public title = 'The Island Discovery';
  public canvasWidth = 800;
  public canvasHeight = 800;
  public island: number[] = new Array(SIZE * SIZE).fill(AreaStatus.Sea);
  public color: string[] = new Array(SIZE * SIZE).fill(SEA_COLOR);
  public newColor = '#00FF00';
  public timeGeneration = 0;
  public numberOfIslands = 0;

  @ViewChild('canvasElement')
  public canvasEl;

  @ViewChild('inputElement')
  public inputEl;

  private position;

  public ngOnInit() {
    this.generate();

    const start = performance.now();
    this.findIslands();
    const end = performance.now();
    this.timeGeneration = Math.floor((end - start) * 100) / 100;

    this.attachEventListeners();
    this.render();
  }

  public onColorChanged(event: Event) {
    // Write your code below.
  }

  private getInitialColor(value: number): string {
    if (value === AreaStatus.Land) {
      return LAND_COLOR;
    }
    return SEA_COLOR;
  }

  private setValueAt(row: number, column: number, value: number) {
    this.island[row * SIZE + column] = value;
  }

  private getValueAt(row: number, column: number): number {
    return this.island[row * SIZE + column];
  }

  private setIslandColor(row: number, column: number, value: string) {
    this.color[row * SIZE + column] = value;
  }

  private getIslandColor(row: number, column: number): string {
    return this.color[row * SIZE + column];
  }

  private randomInt(maxValue: number) {
    return Math.round(Math.random() * maxValue);
  }

  /**
   * generate new island
   */
  private generate() {

    const landColor = this.getInitialColor(AreaStatus.Land);
    let centerCol, centerRow, distanceToCenter, probability;
    for (let islandIdx = 0; islandIdx < NB_ISLANDS; islandIdx++) {
      centerCol = this.randomInt(SIZE);
      centerRow = this.randomInt(SIZE);
      for (let col = 0; col < SIZE; col++) {
        for (let row = 0; row < SIZE; row++) {
          distanceToCenter = Math.pow(col - centerCol, 2) + Math.pow(row - centerRow, 2);
          probability = Math.exp(-distanceToCenter / Math.pow(ISLAND_WIDTH, 2));
          if (Math.random() <= probability) {
            this.setValueAt(row, col, AreaStatus.Land);
            this.setIslandColor(row, col, landColor);
          }
        }
      }
    }
  }

  /**
   * render the island into the canvas Element
   */
  private render() {

    const canvas = this.canvasEl.nativeElement;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    const ctx = canvas.getContext('2d');

    const squareWidth = Math.floor(canvas.width / SIZE);
    const squareHeight = Math.floor(canvas.height / SIZE);

    let x, y;
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        ctx.fillStyle = this.getIslandColor(row, col);
        y = row * squareHeight;
        x = col * squareWidth;
        ctx.fillRect(x, y, squareWidth, squareHeight);
        ctx.fillStyle = '#000';
      }
    }
  }

  /**
   * generate random color
   * @return {string}
   */
  private generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    const color = ['#'];
    for (let i = 0; i < 6; i++) {
      color.push(letters[Math.floor(Math.random() * 16)]);
    }
    return color.join('');
  }

  /**
   * attach event listeners
   */
  private attachEventListeners() {
    // Write your code below.
  }

  /**
   * discover islands and apply a new color to each of them.
   * the definition of an Island is : All LAND square that connect to an other LAND square
   */
  private findIslands() {
    let color: string = this.generateRandomColor();

    // for every land apply depth first search
    // each time we find a new land => it is an island
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (this.getValueAt(row, col) === AreaStatus.Land) {
          this.searchNeighbours(row, col, color);
          this.numberOfIslands += 1;
          color = this.generateRandomColor();
        }
      }
    }
  }

  /**
   * recursive DFS:
   *    - we mark current land as discovered
   *    - for every land: check if there is neighbors
   *      - if we find discovered land we count it
   *      - if not we apply dfs on the undiscovered neighbors
   *      - if sea we do nothing
   *    - if one discovered neighbor (self) we generate a new color
   *    - else we use the current color
   *
   * notes: searchNeighbors calls will stack on the call stack until we find the sea or discovered land
   *        then we go up the stack to color the tiles accordingly
   */
  private searchNeighbours(row: number, col: number, color: string) {
    let hasDiscoveredNeighbors = false;
    this.setValueAt(row, col, AreaStatus.Discovered);
    for (let i = row - 1; i <= row + 1; i++) {
      for (let j = col - 1; j <= col + 1; j++) {
        if (this.getValueAt(i, j) === AreaStatus.Land) {
          this.searchNeighbours(i, j, color);
        }
        if (this.getValueAt(i, j) === AreaStatus.Discovered) {
          hasDiscoveredNeighbors = true;
        }
      }
    }
    if (!hasDiscoveredNeighbors) {
      this.setIslandColor(row, col, this.generateRandomColor());
    } else {
      this.setIslandColor(row, col, color);
    }
  }
}
