import javax.sound.midi.*;
public class MetaMss extends Event{
  float tempo;
  
  public MetaMss(MidiEvent event, float tempo){
    super(event);
    this.tempo=tempo;
  }
  public float getTempo(){
    return tempo;
  }
}
