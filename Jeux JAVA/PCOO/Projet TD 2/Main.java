//Virgile Lassagne et Cazacu Ion , double licence Math Info
import java.util.ArrayList;  
import java.util.List;
import javax.sound.sampled.*;
import javax.sound.midi.*;
import java.io.*;
import java.util.Random; // On importe toute les bibliothéque nécaissaire

public class Main {
  public static void main(String[] args) {
        try {
            // Charger une séquence MIDI depuis un fichier (rajouter un input)
            Sequence sequence = MidiSystem.getSequence(new java.io.File("fichier1.mid"));
            List<Event>[] tableauDeListes = new ArrayList[sequence.getTracks().length];
            long[] resolution= new long[sequence.getTracks().length];
            // On va parcourir les pistes de la séquence
            for (int trackIndex = 0; trackIndex < sequence.getTracks().length; trackIndex++) {
              Track track = sequence.getTracks()[trackIndex];
              
              tableauDeListes[trackIndex] = new ArrayList<>(); // on crée un Tableau qui pour chaque élément va avoir une liste d'évènement sous forme d'objet qu'on va implementer au fur à mesure chaque liste va corresepondre au événement d'une piste
              resolution[trackIndex] = sequence.getResolution();

              // On parcours les événements de la piste
              for (int eventIndex = 0; eventIndex < track.size(); eventIndex++) {
                MidiEvent event = track.get(eventIndex);
                MidiMessage message = event.getMessage();

                // Si c'est un MetaMessage creation d'objet MetaMss
                if (message instanceof MetaMessage) {
                  MetaMessage mm = (MetaMessage) message;
                  byte[] msg = mm.getMessage(); // Le contenu du message
                  if (((msg[1] & 0xFF) == 0x51) && (msg[2] == 0x03)) {
                  int mspq = (msg[5] & 0xFF) | ((msg[4] & 0xFF) << 8) | ((msg[3] & 0xFF) << 16);
                  float tempo = Math.round(60000001f / mspq); // Le tempo est calculé
                    tableauDeListes[trackIndex].add(new MetaMss(event,tempo));//on ajoute à la liste de la piste un object MetaMss 
                  }                  
                }
                // Si C'est un ShortMessage on verifié si c'est le debut d'une note ou la fin
                else if (message instanceof ShortMessage) { 
                  ShortMessage sm = (ShortMessage) message;
                  int cmd = sm.getCommand();
                  if (cmd == 0x90){ // C'est un evenement qui annonce le debut d'une note 
                    tableauDeListes[trackIndex].add(new NoteOn(event,sm));//on ajoute à la liste de la piste un object NoteOn
                  }
                  else if (cmd == 0x80){ // C'est un evenement qui annonce la fin d'une note
                    tableauDeListes[trackIndex].add(new NoteOff(event,sm));//on ajoute à la liste de la piste un object NoteOff
                  }   
                }
              }
            }
          
          float tempsTotal=0;
          List<Son>[] sons = new ArrayList[tableauDeListes.length];  // on va pour simplifier les implementation crée un tableau d'object sons qui va nous permettre d'obtenir les informations qu'on recherche le début la fin en seconde d'un note et sa fréquence on tri aussi ici par piste
          for (int i = 0; i < sons.length; i++) { // On l'initie
            sons[i] = new ArrayList<>();
          }

          for (int liste = 0; liste < tableauDeListes.length; liste++) {
            
            float tempo=120;
            double frequence=0;
            float t1=0;
            float t2=0;
            int canal=0;
            for (int i = 0; i < tableauDeListes[liste].size(); i++){
              if (tableauDeListes[liste].get(i) instanceof MetaMss){
                tempo = ((MetaMss) tableauDeListes[liste].get(i)).getTempo();
              }
              else if(tableauDeListes[liste].get(i) instanceof NoteOn){
                t1 = (((float) tableauDeListes[liste].get(i).tick) * 60 / (tempo * resolution[liste]));
                int octave=((NoteOn) tableauDeListes[liste].get(i)).getOctave();
                frequence = ((NoteOn) tableauDeListes[liste].get(i)).getFrequenceRef()*(float) Math.pow(2, octave - 4);
                //System.out.println(frequence);
                canal=((NoteOn) tableauDeListes[liste].get(i)).getCanal();
              }
              else if(tableauDeListes[liste].get(i) instanceof NoteOff){
                t2 = (((float) tableauDeListes[liste].get(i).tick) * 60 / (tempo * resolution[liste]));
                sons[liste].add(new Son(frequence,t1,t2,canal));  // Comme chaque son dépends du tempo que le métamessage qui le précéde et le debut de la note et la fin de la note une fois qu'on la fin d'une note on a un son qu'on implemente dans notre tableau
              }
            }
            if(t2>tempsTotal){
              tempsTotal=t2; // puisque toute les piste ne commence ou ne se finisse pas en même temps on cherche le temps de fin pour la dernière note joué et on le trouve
            }
          }
          
          
          int[] signal = new int[(int)(44100 * tempsTotal)]; // on génère un tableau avec tempsTotal secondes 
          byte[] bytes=new byte[signal.length]; //on crée un tableau de bytes equivanlent qu'on va par la suite transformer en fichier waw
          for (int i=0;i<sons.length;i++){ 
            for (int j=0;j<sons[i].size();j++){
              int debut= (int) Math.round(sons[i].get(j).getDebut()*44100);
              int fin= (int) Math.round(sons[i].get(j).getFin()*44100);
              for (int n=debut;n<fin;n++){// On va donc ajouter la frequence de chaque son de chaque piste pendant la durée et au moment ou il se joue 
                if (sons[i].get(j).getCanal()!=9){ // Sans oublié que si c'est une percution défini dans le canal 9 alors
                  if ((n % (44100f/sons[i].get(j).getFrequence())) > 22050f/sons[i].get(j).getFrequence()) {
                    signal[n] = signal[n]+127;
                  } else {
                    signal[n] = signal[n]-128;
                  }
                }
                else{
                    signal[n] = (new Random()).nextInt(-128, 128); // alors on crée un bruit blanc
                  }
                }  
              }
            }  
          

          for(int k=0;k<signal.length;k++){ //ici la méthode trouver afin de rendre l'addition des pistes possible est la méthode de saturation donc si élément de signal est > 127 on le ramène a 127 idem pour -128
            if (signal[k]>127){
              bytes[k]=(byte) 127;
            }
            else if (signal[k]<-128){
              bytes[k]=(byte) -128;
            }
            else{
              bytes[k]=(byte) signal[k];
            }
          }

          AudioFormat format = new AudioFormat(44100, 8, 1, true, true); // On crée un format audio en 44100 Hz, 8 bits, 1 canal, signed, mono 
          AudioInputStream ais = new AudioInputStream(new ByteArrayInputStream(bytes), format, bytes.length);
          File file = new File("mon_fichier.wav"); 
          AudioSystem.write(ais, AudioFileFormat.Type.WAVE, file);}


          

          
        catch (InvalidMidiDataException | java.io.IOException e) {
            e.printStackTrace();
        }
    }
}