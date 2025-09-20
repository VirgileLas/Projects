import javax.sound.midi.*;
public abstract class Event{
  public long tick;
  public Event(MidiEvent event){
    this.tick = event.getTick();
  }
}