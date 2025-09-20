import socket
import sys
import os
import signal
import time
MAX_BYTES=4096
pid_terminal_saisie = None
pid_terminal_affichage = None
pid_saisie=None
pid_affichage=None
fin=False
reconnect=False
sock=None
chemin_fifo = '/var/tmp/killer.fifo'
chemin_log = '/var/tmp/killer.log'

def sigusr2_handler_superviseur(sig,frame):
    global sock, reconnect, pid_affichage, pid_saisie
    host, port = verify_args()
    sock.close()
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    while reconnect:
        try:
            sock.connect((host, port))
            reconnect=False
            print("Reconnexion réussie!", file=log, flush=True)
        except Exception as e:
            with open(chemin_log,'a') as log:
                print("Erreur de reconnexion, tentative de reconnexion en cours.", file=log, flush=True)
                time.sleep(3)

    if os.path.isfile("/var/tmp/cookie"):
        with open('/var/tmp/cookie','r') as file:
            cookie=file.readline()
        if cookie!='':
            sock.send(('!!cookie '+cookie[:-1]).encode())
        else:
            sock.send('!!non'.encode())

    pid_affichage=os.fork()
    if pid_affichage==0:
        recevoir_messages()
    else:
        pid_saisie=os.fork()
        if pid_saisie==0:
            envoyer_messages()

def sigusr1_handler_superviseur(sig,frame):
    global reconnect
    reconnect=True
    os.kill(pid_saisie, signal.SIGUSR1)

def sigusr1_handler_saisie(sig, frame):
    global reconnect
    reconnect=True

def sigint_handler(sig, frame):
    global fin
    fin=True
    print('Signal SIGINT reçu, fermeture des processus enfants.')
    os.kill(pid_terminal_affichage, signal.SIGTERM)
    os.kill(pid_terminal_saisie, signal.SIGTERM)
    os.kill(pid_affichage, signal.SIGTERM)
    os.kill(pid_saisie, signal.SIGTERM)
    sys.exit(0)

def sigchld_handler(sig, frame):
    global pid_terminal_saisie, pid_terminal_affichage
    if fin==False:
        pid, _ = os.waitpid(-1, os.WNOHANG)
        if pid==pid_terminal_saisie:
            pid_terminal_saisie=lancer_terminal_saisie()
            print("Relance terminal de saisie.")
        elif pid==pid_terminal_affichage:
            pid_terminal_affichage=lancer_terminal_affichage()
            print("Relance terminal d'affichage.")

def lancer_terminal_saisie():
    pid = os.fork()
    if pid == 0:
        os.execlp('xterm', 'xterm', '-e', f'cat > {chemin_fifo}')
    return pid

def lancer_terminal_affichage():
    pid = os.fork()
    if pid == 0:
        os.execlp('xterm', 'xterm', '-e', f'tail -f {chemin_log}')
    return pid

def diviser_message(decoded_mss):
    if decoded_mss=="":
        return [],None,''
    
    pseudos=[]
    split_mss = decoded_mss.split(' ')

    for i in range(len(split_mss)):
        if split_mss[0]!="" and split_mss[0][0]=='@':
            pseudo_destinataire = split_mss[0][1:]
            pseudos.append(pseudo_destinataire)
            del split_mss[0]
        else:
            break

    if split_mss[0][0]=='!':
        commande=split_mss[0]
        del split_mss[0]
    else:
        commande=None

    message = ' '.join(split_mss)
    if len(message)==0:
        message=''
    return pseudos,commande, message

def verify_args():
    if len(sys.argv) != 3:
        print("Veuillez l'utiliser la commande de la façon suivante: python3 chat.killer.client.py <IP> <Port>")
        sys.exit(1)
    try:
        port = int(sys.argv[2])
    except:
        print("Veuillez donner un port qui est un nombre.")
        sys.exit(1)
    return sys.argv[1], int(sys.argv[2])

def creer_fifo(chemin_fifo):
    if os.path.exists(chemin_fifo):
        os.unlink(chemin_fifo)
    os.mkfifo(chemin_fifo)

def creer_log(chemin_log):
    open(chemin_log, 'w').close()

def envoyer_messages():
    signal.signal(signal.SIGUSR1,sigusr1_handler_saisie)
    with open(chemin_fifo, 'r') as fifo:
        while True:
            data = fifo.readline()
            if reconnect==True and data.strip()=='!reconnect':
                os.kill(os.getppid(),signal.SIGUSR2)
                os.kill(os.getpid(),signal.SIGTERM)
            else:
                sock.send(data.encode())
                    

def recevoir_messages():
    with open(chemin_log, 'a') as log:
        while True:
            data = sock.recv(MAX_BYTES)
            if data:
                messages = data.decode().split('\n')[:-1]
                for message in messages:
                    _,commande,suite=diviser_message(message)
                    if message=="!suspend":
                        os.kill(pid_terminal_saisie,signal.SIGSTOP)
                    elif message=='!forgive':
                        os.kill(pid_terminal_saisie,signal.SIGCONT)
                    elif message=='!!ping'or message=='!ban':
                        pass
                    elif commande=='!!exit':
                        open("/var/tmp/cookie",'w').close()
                        os.kill(os.getppid(),signal.SIGINT)
                    elif commande=='!!cookie':
                        cookie=suite
                        with open('/var/tmp/cookie', 'w') as file:
                            file.write(cookie+'\n')
                    else:
                        print(message, file=log, flush=True)
            else:
                print("Vous avez été déconnecté du serveur, veuillez vous reconnecter.", file=log, flush=True)
                os.kill(os.getppid(),signal.SIGUSR1)
                os.kill(os.getpid(),signal.SIGTERM)
            

if __name__ == "__main__":
    host, port = verify_args()

    creer_fifo(chemin_fifo)
    creer_log(chemin_log)

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.connect((host, port))
        print(f"Connecté au serveur {host}:{port}")
    except Exception as e:
        print(e)
        print("L'adresse ip ou le port indiqué sont incorrects, veuillez reéssayer.")
        sys.exit(1)
    
    if os.path.isfile("/var/tmp/cookie"):
        with open('/var/tmp/cookie','r') as file:
            cookie=file.readline()
        if cookie!='':
            sock.send(('!!cookie '+cookie[:-1]).encode())
        else:
            sock.send('!!non'.encode())

    superviseur=os.getpid()

    pid_terminal_saisie=lancer_terminal_saisie()
    pid_terminal_affichage=lancer_terminal_affichage()

    pid_affichage=os.fork()
    if pid_affichage==0:
        recevoir_messages()
    else:
        pid_saisie=os.fork()
        if pid_saisie==0:
            envoyer_messages()
    
    signal.signal(signal.SIGCHLD, sigchld_handler)
    signal.signal(signal.SIGINT, sigint_handler)
    signal.signal(signal.SIGUSR1,sigusr1_handler_superviseur)
    signal.signal(signal.SIGUSR2,sigusr2_handler_superviseur)

    while True:
        pass