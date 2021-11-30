
class Point { //oh yea.... and I use this as a VECTOR sometimes so HAVE FUN trying to figure out what I'm doing :-D (i'm so sorry)
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    add(p2) {
        return new Point(this.x + p2.x, this.y + p2.y);
    }
    sub(p2) {
        return new Point(this.x - p2.x, this.y - p2.y);
    }
    equals(p2) {
        if (this.x == p2.x && this.y == p2.y)
        {
            return true;
        } else {
            return false;
        }
    }
    copy()
    {
        return new Point(this.x, this.y);
    }
}

function distBetweenPoints(p1,p2) {
    //Find the distance between two points (point objects) P1 and P2
    return Math.sqrt(Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2));
}
function findMidpoint(p1,p2) {
    //Find the midpoint (return the object) between p1 and p2
    var slopeY = (p2.y-p1.y);
    var slopeX = (p2.x-p1.x);
    return new Point(p1.x+slopeX/2, p1.y+slopeY/2);
}
function distToLine(L1,L2,P) {
    /*This function finds the distance between line(L1,L2) and point P
    L1 = line end 1 (a Point object),  L2 = line end 2 (a Point object),  P = point (a Point object)

    We are going to do this by turning the line into a series of points and finding the nearest point to P 
        We will find the total length of the line and put points along the line every ...idk yet... amount (see below)*/
    var len = distBetweenPoints(L1,L2); //len = line length (dist from L1 to L2)
    var numPoints = len/10; //number of points, every 10 pixels or so.
    var incrementY = (L2.y-L1.y)/numPoints; //what we will increment the x and y positions by each time in the loop
    var incrementX = (L2.x-L1.x)/numPoints;
    var curPoint = new Point(L1.x,L1.y);
    var bestDist = 10000000000;
    var dist = 10000000000000;
    for (var i=0; i<numPoints; i++)
    {
        dist = distBetweenPoints(curPoint,P);
        bestDist = Math.min(bestDist,dist);
        /* //DEBUG TOOLS BELOW
        fill(255,0,0); 
        circle(curPoint.x,curPoint.y,10); */
        curPoint.y += incrementY;
        curPoint.x += incrementX;
    }
    return bestDist;
}

function getVector(p1,p2)
{
    return new Point(p2.x-p1.x, p2.y-p1.y);
}