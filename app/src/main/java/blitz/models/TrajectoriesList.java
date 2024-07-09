package blitz.models;

import java.util.ArrayList;

import javax.sound.midi.Track;

public class TrajectoriesList {

    // -=-=-=- FIELDS -=-=-=-

    private static ArrayList<Trajectory> trajectoriesList = new ArrayList<Trajectory>();

    private static ArrayList<TrajectoriesListListener> listeners = new ArrayList<>();



    // -=-=-=- METHODS -=-=-=-

    public static void moveTrajectoryDown(Trajectory tr) {
        if (!trajectoriesList.contains(tr)) {
            return;
        }
    
        int indexTR = trajectoriesList.indexOf(tr);
        if (indexTR == trajectoriesList.size() - 1) {
            return;
        }
    
        int indexTR2 = indexTR + 1;
        Trajectory temp = trajectoriesList.get(indexTR2);
        trajectoriesList.set(indexTR2, tr);
        trajectoriesList.set(indexTR, temp);
        notifyTrajectoriesListListeners();
    }

    public static void moveTrajectoryUp(Trajectory tr) {
        if (!trajectoriesList.contains(tr)) {
            return;
        }
    
        int indexTR = trajectoriesList.indexOf(tr);
        if (indexTR == 0) {
            return;
        }
    
        int indexTR2 = indexTR - 1;
        Trajectory temp = trajectoriesList.get(indexTR2);
        trajectoriesList.set(indexTR2, tr);
        trajectoriesList.set(indexTR, temp);
        notifyTrajectoriesListListeners();
    }
    
    public static void addTrajecoriesListListener(TrajectoriesListListener listener){
        listeners.add(listener);
    }


    public static void removeTrajecoriesListListener(TrajectoriesListListener listener){
        listeners.remove(listener);
    }

    private static void notifyTrajectoriesListListeners(){
        for (TrajectoriesListListener listener : listeners) {
            listener.TrajectoryListChanged();
        }
    }

    /**
     * 
     * 
     * @return
     */
    public static ArrayList<Trajectory> getTrajectoriesList() {
        return trajectoriesList;
    }

    public static Trajectory getTrajectory(int index) {
        return trajectoriesList.get(index);
    }

    public static ArrayList<Trajectory> copyTrajectoriesList() {
        return new ArrayList<Trajectory>(trajectoriesList);
    }

    public static boolean contains(Trajectory tr){
        return trajectoriesList.contains(tr);
    }

    public static Trajectory getTrajectoryByControlPoint(ControlPoint cp) {

        for (Trajectory trajectory : trajectoriesList) {
            if(trajectory.contains(cp)){
                return trajectory;
            }
        }

        return null;

    }

    public static int getTrajectoryIndex(Trajectory tr){
        return trajectoriesList.indexOf(tr);
    }

    public static void addTrajectory(Trajectory tr){
        if(tr == null){
            throw new NullPointerException("Trajectory cannot be null!");
        }
        trajectoriesList.add(tr);
        notifyTrajectoriesListListeners();
    }

    public static void addTrajectory(){
        trajectoriesList.add(new Trajectory(getNextAvaliableName()));
        notifyTrajectoriesListListeners();
    }

    public static void removeTrajectory(Trajectory tr){
        if(tr == null){
            throw new NullPointerException("Trajectory cannot be null!");
        }

        trajectoriesList.remove(tr);
        notifyTrajectoriesListListeners();
    }

    public static String getNextAvaliableName(){
        
        String name = null;
        int i = 1;
        boolean nameIsTaken = true;
        while(nameIsTaken) { 
            name = "Trajectory " + i++;
            nameIsTaken = false;
            for (Trajectory tr : trajectoriesList)
                if(tr.getName().equals(name))
                    nameIsTaken = true;
        }
        return name;
    }
    
}
