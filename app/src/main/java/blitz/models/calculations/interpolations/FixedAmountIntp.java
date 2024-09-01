package blitz.models.calculations.interpolations;

import java.util.ArrayList;

import blitz.models.calculations.AbstractInterpolation;
import blitz.models.calculations.AbstractSpline;
import blitz.models.trajectories.Trajectory;
import blitz.models.trajectories.trajectoryComponents.ControlPoint;
import blitz.models.trajectories.trajectoryComponents.FollowPoint;
import blitz.services.CartesianCoordinate;

public class FixedAmountIntp extends AbstractInterpolation{

    @Override
    public ArrayList<FollowPoint> calculate(Trajectory tr, AbstractSpline splineObj) {

        this.splineObj = splineObj;

        double minSpeed = tr.getMinSpeed();
        double maxSpeed = tr.getMaxSpeed();
        double minBentRate = tr.getMinBentRate();
        double maxBentRate = tr.getMaxBentRate();

        ArrayList<FollowPoint> followPoints = new ArrayList<>();
        ArrayList<ControlPoint> controlPoints = tr.getAllControlPoints();

        boolean isLastCurve;

        for (int i = 0; i < controlPoints.size()-1; i++) {

            ControlPoint p0 = controlPoints.get(i);
            ControlPoint p1 = controlPoints.get(i + 1);
            int numSegments = p0.getNumSegments();

            isLastCurve = (p1 == tr.getLast());

            for (int j = 0; j < numSegments; j++) {
                
                double t = (double) j / numSegments;
                CartesianCoordinate coord = splineObj.evaluate(p0, p1, t);
                double currentSpeed = calculateSpeedAtT(minSpeed, maxSpeed, minBentRate, maxBentRate, p0, p1, t);
                if(isLastCurve){
                    double decliningSpeed = maxSpeed - (maxSpeed - minSpeed) * t;
                    if(decliningSpeed < currentSpeed){
                        currentSpeed = decliningSpeed;
                    }
                }
                FollowPoint p = new FollowPoint(coord, currentSpeed, p0);
                followPoints.add(p);

            }

        }

        ControlPoint last = tr.getLast();
        FollowPoint fp = new FollowPoint(last.getPosition(), 0.0, last);
        followPoints.add(fp);

        return followPoints;

    }
    
}
