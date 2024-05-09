import { Vector2 } from './external/three.min.js';


// //////////////////////////////////////////
// Constraints
// //////////////////////////////////////////

export class DistanceConstraint {
    constructor(point1, point2, targetDist) {
        this.point1 = point1;
        this.point2 = point2;
        this.targetDist = targetDist;
    }

    apply() {
        // Calculate the distance between the two points.
        // Move the points towards or away from each other to match the target distance.
        const diff = new Vector2().subVectors(this.point2.position, this.point1.position);
        const dist = diff.length();
        const scale = (dist === 0) ? 1 : (dist - this.targetDist) / dist;

        const delta = diff.multiplyScalar(scale * 0.5);

        this.point1.position.add(delta);
        this.point2.position.sub(delta);

        return (dist - this.targetDist) ** 2;
    }

    draw(ctx) {
        const p = new Vector2().addVectors(this.point1.position, this.point2.position).multiplyScalar(0.5);
        ctx.fillText("D", p.x, p.y - 10);
    }
}

export class HorizontalConstraint {
    constructor(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
    }

    apply() {
        // Calculate the average y location of the two endpoints.
        // Move the y coordinate of each endoint to the average.
        const diff = new Vector2(0, this.point2.position.y - this.point1.position.y);
        const dy = diff.y * 0.5;

        this.point1.position.y += dy;
        this.point2.position.y -= dy;

        return diff.y ** 2;
    }

    draw(ctx) {
        const p = new Vector2().addVectors(this.point1.position, this.point2.position).multiplyScalar(0.5);
        ctx.fillText("Hz", p.x, p.y + 20);
    }
}

export class VerticalConstraint {
    constructor(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
    }
    apply() {
        // Calculate the average x location of the two endpoints.
        // Move the x coordinate of each endpoint to the average.
        const diff = new Vector2(this.point2.position.x - this.point1.position.x, 0);
        const dx = diff.x * 0.5;
        this.point1.position.x += dx;
        this.point2.position.x -= dx;
        return diff.x ** 2;
    }
    draw(ctx) {
        const p = new Vector2().addVectors(this.point1.position, this.point2.position).multiplyScalar(0.5);
        ctx.fillText("V", p.x - 10, p.y);
    }
}

export class FixedConstraint {
    constructor(point, targetX, targetY) {
        this.point = point;
        this.targetX = targetX;
        this.targetY = targetY;
    }

    apply() {
        // Move the point to the fixed location
        const diff = new Vector2(this.targetX - this.point.position.x, this.targetY - this.point.position.y);
        this.point.position.x += diff.x;
        this.point.position.y += diff.y;

        return diff.x ** 2 + diff.y ** 2;
    }

    draw(ctx) { ctx.fillText("Fix", this.point.position.x, this.point.position.y + 20); }
}

export class CoincidentConstraint {
    constructor(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
    }

    apply() {
        // Calculate the average of the two points
        // Move both points there
        const diff = new Vector2(this.point2.position.x - this.point1.position.x, this.point2.position.y - this.point1.position.y);
        const dx = diff.x * 0.5;
        const dy = diff.y * 0.5;

        this.point1.position.x += dx;
        this.point1.position.y += dy;
        this.point2.position.x -= dx;
        this.point2.position.y -= dy;

        return diff.x ** 2 + diff.y ** 2;
    }

    draw(ctx) { ctx.fillText("C", this.point1.position.x, this.point1.position.y - 20); }
}

export class AngleConstraint {
    constructor(point1, point2, point3, point4, targetAngle) {
        this.point1 = point1;
        this.point2 = point2;
        this.point3 = point3;
        this.point4 = point4;
        this.targetAngle = targetAngle;
    }

    apply() {
        // Calculate the angle between the two lines.
        // Move the control points perpendicularly to each lien to match the target angle.
        const AB = new Vector2().subVectors(this.point2.position, this.point1.position);
        const CD = new Vector2().subVectors(this.point4.position, this.point3.position);

        const ABdotCD = AB.dot(CD);
        const ABcrossCD = AB.cross(CD);

        const angle = Math.atan2(ABcrossCD, ABdotCD);
        const deltaAngle = Math.min(Math.max(angle - this.targetAngle, -Math.PI / 8), Math.PI / 8);

        const correctionVectorAB = new Vector2(deltaAngle * AB.y, -deltaAngle * AB.x);
        const correctionVectorCD = new Vector2(deltaAngle * CD.y, -deltaAngle * CD.x);

        this.point1.position.add(correctionVectorAB);
        //this.point2.position.sub(correctionVectorAB);
        //this.point3.position.sub(correctionVectorCD);
        this.point4.position.add(correctionVectorCD);

        return (angle - this.targetAngle) ** 2;
    }

    draw(ctx) {
        const AB = new Vector2().subVectors(this.point1.position, this.point2.position);

        const angleAB = Math.atan2(AB.y, AB.x);

        const center = new Vector2().addVectors(this.point2.position, this.point3.position).multiplyScalar(0.5);

        const radius = 20;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, angleAB, angleAB + this.targetAngle + Math.PI);
        ctx.stroke();
    }
}

export class LineDistanceConstraint {
    constructor(point, lineStart, lineEnd, targetDistance) {
        this.point = point;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
        this.targetDistance = targetDistance;
    }

    apply() {
        // Calculate the length of the perpendicular vector between the line and the point.
        // Move the point along the perpendicular vector to match the target distance.
        const lineVec = new Vector2().subVectors(this.lineEnd.position, this.lineStart.position);
        const lineLen = lineVec.length();
        const normalizedLineVec = lineVec.clone().divideScalar(lineLen);
        const pointVector = new Vector2().subVectors(this.point.position, this.lineStart.position);
        const dotProduct = pointVector.dot(normalizedLineVec);
        const closestPointOnLine = new Vector2().addVectors(this.lineStart.position, normalizedLineVec.multiplyScalar(dotProduct));
        const vecToClosest = new Vector2().subVectors(this.point.position, closestPointOnLine);
        const distToClosest = vecToClosest.length();
        const diff = distToClosest - this.targetDistance;
        const adjust = (distToClosest === 0) ? 0 : diff / distToClosest;

        const delta = vecToClosest.clone().multiplyScalar(adjust * 0.5);

        this.point.position.sub(delta);

        this.lineStart.position.add(delta);
        this.lineEnd.position.add(delta);

        return diff ** 2;
    }

    draw(ctx) {
        const lineVec = new Vector2().subVectors(this.lineEnd.position, this.lineStart.position);
        const lineLen = lineVec.length();
        const normalizedLineVec = lineVec.clone().divideScalar(lineLen);
        const pointVector = new Vector2().subVectors(this.point.position, this.lineStart.position);
        const dotProduct = pointVector.dot(normalizedLineVec);
        const closestPointOnLine = new Vector2().addVectors(this.lineStart.position, normalizedLineVec.multiplyScalar(dotProduct));

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.setLineDash([5, 5]);
        ctx.moveTo(this.point.position.x, this.point.position.y);
        ctx.lineTo(closestPointOnLine.x, closestPointOnLine.y);
        ctx.stroke();
        ctx.restore();
    }
}


// //////////////////////////////////////////
// Higher order constraints
// //////////////////////////////////////////

export class ArcConstraint {
    constructor(point1, point2, center, radius) {
        this.center = center;
        this.distanceConstraint1 = new DistanceConstraint(point1, center, radius);
        this.distanceConstraint2 = new DistanceConstraint(point2, center, radius);
    }

    apply() {
        const error1 = this.distanceConstraint1.apply();
        const error2 = this.distanceConstraint2.apply();
        return error1 + error2;
    }

    draw(ctx) {
        let p = this.center.position;
        ctx.fillText("Arc", p.x + 10, p.y + 10);
    }
}

export class TangentConstraint {
    constructor(lineStart, lineEnd, arcPoint, arcCenter) {
        this.angleConstraint = new AngleConstraint(lineStart, lineEnd, arcPoint, arcCenter, Math.PI / 2);
    }

    apply() { 
        return this.angleConstraint.apply(); 
    }

    draw(ctx) {
        let p = new Vector2().addVectors(this.angleConstraint.point2.position, this.angleConstraint.point3.position).multiplyScalar(0.5);
        ctx.fillText("T", p.x - 20, p.y);
    }
}

export class ArcAngleConstraint {
    constructor(arcPoint1, arcPoint2, arcCenter, targetAngle) {
        this.angleConstraint = new AngleConstraint(arcPoint1, arcCenter, arcCenter, arcPoint2, targetAngle);
    }

    apply() {
        return this.angleConstraint.apply();
    }

    draw(ctx) {
        this.angleConstraint.draw(ctx);
    }
}

