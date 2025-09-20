import javax.sound.midi.*;
  public abstract class ShortMss extends Event{
    public int channel;
    public int key;
    public int octave;
    public int note;
    public int volume;
    public int cmd;
  
  public ShortMss(MidiEvent event, ShortMessage sm){
    super(event);
    this.channel = sm.getChannel();
    this.tick = event.getTick();
    this.key = sm.getData1();
    this.octave = (key / 12)-1;
    this.note = key % 12;
    this.volume = sm.getData2();
    
  }
}