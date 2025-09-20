import java.util.HashMap;
import javax.sound.midi.*;

public class NoteOn extends ShortMss{

  public NoteOn(MidiEvent event,ShortMessage sm){
    super(event,sm);
  }
  public int getOctave(){
    return octave;
  }
  public int getCanal(){
    return channel;
  }
  public Double getFrequenceRef(){
    HashMap<Integer,Double> FrequenceOctave4 = new HashMap<>();
    FrequenceOctave4.put(0, 261.626);
    FrequenceOctave4.put(1, 277.183);
    FrequenceOctave4.put(2, 293.665);
    FrequenceOctave4.put(3, 311.127);
    FrequenceOctave4.put(4, 329.628);
    FrequenceOctave4.put(5, 349.228);
    FrequenceOctave4.put(6, 369.994);
    FrequenceOctave4.put(7, 391.995);
    FrequenceOctave4.put(8, 415.305);
    FrequenceOctave4.put(9, 440.000);
    FrequenceOctave4.put(10, 466.164);
    FrequenceOctave4.put(11, 493.883); 
    return FrequenceOctave4.get(this.octave);
  }
}