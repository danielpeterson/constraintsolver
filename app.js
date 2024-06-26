import * as Model from './model.js';
import * as Constraint from './constraints.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


// //////////////////////////////////////////
// Model
// //////////////////////////////////////////

let points = [];
let lines = [];
let arcs = [];
let constraints = [];


// //////////////////////////////////////////
// Controller
// //////////////////////////////////////////

window.onload = () => {
    // Code entry point

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    points.push(
        new Model.Point(100, 100),
        new Model.Point(200, 300),
        new Model.Point(400, 200),
        new Model.Point(500, 100),

        // Arc
        new Model.Point(600, 100),

        // Corner
        new Model.Point(600, 400),
        new Model.Point(650, 500),
    );

    lines.push(
        new Model.Line(points[0], points[1]),
        new Model.Line(points[1], points[2]),
        new Model.Line(points[2], points[3]),
        new Model.Line(points[5], points[6]),
        new Model.Line(points[6], points[0]),
    );

    arcs.push(
        new Model.Arc(points[3], points[5], points[4]),
    );

    constraints.push(
        new Constraint.DistanceConstraint(points[0], points[1], 200),

        new Constraint.FixedConstraint(points[1], 230, 330),

        new Constraint.AngleConstraint(points[0], points[1], points[1], points[2], Math.PI / 4),
        new Constraint.DistanceConstraint(points[1], points[2], 250),
        new Constraint.HorizontalConstraint(points[1], points[2]),
        new Constraint.AngleConstraint(points[1], points[2], points[2], points[3], -Math.PI / 4),

        new Constraint.LineDistanceConstraint(points[3], points[1], points[2], 100),

        new Constraint.TangentConstraint(points[2], points[3], points[3], points[4]),
        new Constraint.ArcConstraint(points[3], points[5], points[4], 50),
        new Constraint.ArcAngleConstraint(points[3], points[5], points[4], - Math.PI / 4),

        new Constraint.VerticalConstraint(points[5], points[6]),
        new Constraint.HorizontalConstraint(points[6], points[0]),
    );

    stepSolver();
    drawAll();
}

function stepSolver() {
    if (mouseConstraint != null) {
        mouseConstraint.apply();
        return
    }

    let MSE = Number.MAX_VALUE;
    let iterations = 0;
    const startTime = performance.now();
    for (; iterations < 10000 && MSE > 0.00001; iterations++) {
        MSE = Math.sqrt(constraints.reduce((acc, constraint) => acc + constraint.apply(), 0) / constraints.length)
    };

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    document.getElementById('iterations').textContent = iterations;
    document.getElementById('error').textContent = MSE.toPrecision(4);
    document.getElementById('time').textContent = executionTime.toFixed(2);
}


// //////////////////////////////////////////
// View
// //////////////////////////////////////////

function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "12px sans-serif";

    // Points
    ctx.fillStyle = 'black';
    points.forEach(point => point.draw(ctx));

    // Lines
    ctx.strokeStyle = 'black';
    lines.forEach(line => line.draw(ctx));

    // Arcts
    ctx.strokeStyle = 'black';
    arcs.forEach(arc => arc.draw(ctx));

    // Constraints
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';
    constraints.forEach(constraint => constraint.draw(ctx));
}

let mouseConstraint = null;

canvas.addEventListener('mousedown', (event) => {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    let selectedPoint = points.find(point => Math.sqrt((point.position.x - mouseX) ** 2 + (point.position.y - mouseY) ** 2) <= 5);

    if (selectedPoint != null && mouseConstraint == null) {
        mouseConstraint = new Constraint.FixedConstraint(selectedPoint, mouseX, mouseY)
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (mouseConstraint != null) {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;

        mouseConstraint.targetX = mouseX;
        mouseConstraint.targetY = mouseY;

        stepSolver();
        drawAll();
    }
});

canvas.addEventListener('mouseup', () => {
    if (mouseConstraint != null) {
        mouseConstraint = null;
    }

    stepSolver();
    drawAll();
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawAll();
});
