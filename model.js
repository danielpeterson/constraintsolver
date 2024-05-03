import { Vector2 } from './external/three.min.js';


// //////////////////////////////////////////
// Model
// //////////////////////////////////////////

export class Point {
    static idCounter = 0;

    constructor(x, y) {
        this.id = Point.idCounter++;
        this.position = new Vector2(x, y);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(`P${this.id}`, this.position.x + 10, this.position.y);
    }
}

export class Line {
    constructor(startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.startPoint.position.x, this.startPoint.position.y);
        ctx.lineTo(this.endPoint.position.x, this.endPoint.position.y);
        ctx.stroke();
    }
}

export class Arc {
    constructor(startPoint, endPoint, centerPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.centerPoint = centerPoint;
    }

    draw(ctx) {
        const startAngle = Math.atan2(this.startPoint.position.y - this.centerPoint.position.y, this.startPoint.position.x - this.centerPoint.position.x);
        const endAngle = Math.atan2(this.endPoint.position.y - this.centerPoint.position.y, this.endPoint.position.x - this.centerPoint.position.x);
        const radius = this.centerPoint.position.distanceTo(this.startPoint.position);

        ctx.beginPath();
        ctx.arc(this.centerPoint.position.x, this.centerPoint.position.y, radius, startAngle, endAngle);
        ctx.stroke();
    }
}
