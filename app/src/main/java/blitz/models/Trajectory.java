package blitz.models;

import java.util.ArrayList;

import blitz.servises.CartesianCoordinate;

public class Trajectory {

    // -=-=-=- METHODS -=-=-=-

    private String name;
    private ArrayList<ControlPoint> controlPoints;





    // -=-=-=- CONSTRUCTORS -=-=-=-

    /**
     * Initializes Trajectory with specified name and no curves.
     * 
     * @param name                  name of this Trajectory
     */
    public Trajectory(String name){
        setName(name);
        controlPoints = new ArrayList<ControlPoint>();
    }

    /**
     * Initializes Trajectory as a copy of other.
     * 
     * @param other                 some other Trajectory
     */
    public Trajectory(Trajectory other){
        setName(other.getName());
        controlPoints = other.copyControlPoints();
    }





    // -=-=-=- METHODS -=-=-=-

    public void setName(String name){
        this.name = name;
    }

    public String getName(){
        return name;
    }

    public void addControlPoint(ControlPoint cp){
        controlPoints.add(cp);
    }

    
    public void insertControlPoint(int index, ControlPoint cp){
        controlPoints.add(index, cp);
    }

    public void removeControlPoint(ControlPoint cp){
        controlPoints.remove(cp);
    }

    public void removeControlPoint(int index){
        controlPoints.remove(index);
    }

    public boolean contains(ControlPoint cp) {
        for (ControlPoint controlPoint : controlPoints) {
            if(controlPoint == cp){
                return true;
            }
        }
        return false;
    }

    public int indexOf(ControlPoint cp){
        return controlPoints.indexOf(cp);
    }

    public ArrayList<ControlPoint> getAllControlPoints(){
        return controlPoints;
    }

    public ArrayList<ControlPoint> copyControlPoints(){
        return new ArrayList<ControlPoint>(controlPoints);
    }

    public ControlPoint getControlPoint(int index){
        return controlPoints.get(index);
    }

    public ControlPoint getControlPoint(String name){
        for (ControlPoint controlPoint : controlPoints) {
            if(controlPoint.getName().equals(name)){
                return controlPoint;
            }
        }
        return null;
    }

    /**
     * Calculates points on a Bezier curve starting from the given ControlPoint.
     * 
     * @param cp The starting ControlPoint of the Bezier curve.
     * @return An ArrayList of CartesianCoordinate points on the Bezier curve.
     * @throws NullPointerException if the trajectory does not contain the given ControlPoint.
     * @throws IndexOutOfBoundsException if the given ControlPoint is the last in the list.
     */
    public ArrayList<CartesianCoordinate> calculateBezierCurveFrom(ControlPoint cp) {
        // Validation
        if (cp == null) {
            throw new NullPointerException("ControlPoint cannot be null!");
        }
        if (!controlPoints.contains(cp)) {
            throw new NullPointerException("Trajectory does not contain this ControlPoint!");
        }
        if (controlPoints.get(controlPoints.size() - 1).equals(cp)) {
            throw new IndexOutOfBoundsException("ControlPoint is the last in the list; it is not the beginning of any curve!");
        }

        // Presets
        int index = controlPoints.indexOf(cp);
        ControlPoint nextCP = controlPoints.get(index + 1);

        CartesianCoordinate strt = new CartesianCoordinate(cp.getX(), cp.getY());
        CartesianCoordinate h1 = cp.getAbsStartHelperPos();
        CartesianCoordinate h2 = nextCP.getAbsEndHelperPos();
        CartesianCoordinate end = new CartesianCoordinate(nextCP.getX(), nextCP.getY());

        int numSeg = cp.getNumSegments();
        ArrayList<CartesianCoordinate> bezierCoordinates = new ArrayList<>(numSeg + 1);

        // Calculations
        for (int i = 0; i <= numSeg; i++) {
            double t = (double) i / numSeg;
            double x = Math.pow(1 - t, 3) * strt.getX() + 3 * Math.pow(1 - t, 2) * t * h1.getX() + 3 * (1 - t) * Math.pow(t, 2) * h2.getX() + Math.pow(t, 3) * end.getX();
            double y = Math.pow(1 - t, 3) * strt.getY() + 3 * Math.pow(1 - t, 2) * t * h1.getY() + 3 * (1 - t) * Math.pow(t, 2) * h2.getY() + Math.pow(t, 3) * end.getY();
            bezierCoordinates.add(new CartesianCoordinate(x, y));
        }

        return bezierCoordinates;
    }


    
}
