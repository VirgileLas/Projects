import socket
import select
import sys
import random
import os
import time
import random
MAX_BYTES = 4096
debut_partie=False

def cookie_setup(clients,sock):
    number = random.randint(1000000000, 9999999999)
    for client in clients:
        if(clients[client]['cookie'] == number and clients[client]['connected']!=True):
            number = cookie_setup(clients)
    clients[sock]['cookie']=number
    envoie_message(clients,"!!cookie "+str(clients[client_socket]['cookie']),"Serveur",client_socket)
    return clients

def reception_cookie(cookie_recu,clients,sock):
    for client in clients:
        if clients[client]['cookie']==cookie_recu and clients[client]['connected']==True:
            envoie_message(clients,'Serveur: Le joueur avec ce cookie est déjà connecté, vous allez être enregistré en tant que nouveau joueur.','Serveur',sock)
            return clients, True
        elif clients[client]['cookie']==int(cookie_recu) and clients[client]['connected']==False:
            envoie_message(clients,'Serveur: Vos informations ont été retrouvées, elles ont été mises à jour.','Serveur',sock)
            
            clients[sock]=clients.pop(client)
            clients[sock]['connected']=True
            return clients, False
        
    with open('/var/tmp/killer.state', 'r') as file:
        for line in file:
            if line=='Participants:\n':
                break
            line_split=line.strip().split(',')
            if line_split[0]==cookie_recu:
                clients[sock] = {'username': line_split[1], 'status': line_split[2], 'cookie': int(line_split[0]), 'connected':True}
                envoie_message(clients, 'Serveur: Vos informations ont été retrouvées, elles ont été mises à jour.',"Serveur",sock)
                return clients, False

    return clients, True

def heartbeat(clients, participants, last_time):
    if time.time() - last_time > 5:
        save_client_data(clients, participants)
        return time.time()
    return last_time
            
def save_client_data(clients, participants):
        liste_state=[]
        new_file_path = '/var/tmp/killer.state_new'
        old_file_path = '/var/tmp/killer.state'
        if os.path.isfile(old_file_path):
            with open(old_file_path,'r') as file:
                for line in file:
                    if line!='Participants:\n':
                        line=line.strip().split(',')
                        client_avec_cookie = any(client['cookie'] == int(line[0]) for client in clients.values())
                        if not client_avec_cookie:
                            liste_state.append(line)
                    else:
                        break
        with open(new_file_path, 'w') as file:
            for i in liste_state:
                line=f"{i[0]},{i[1]},{i[2]}\n"
                file.write(line)
            for sock in clients:
                if clients[sock]['username']!=None:
                    line = f"{clients[sock]['cookie']},{clients[sock]['username']},{clients[sock]['status']}\n"
                    file.write(line)
            if participants!=[]:
                file.write('Participants:\n')
                for participant in participants:
                    file.write(participant+'\n')
                    
        if os.path.exists(old_file_path):
            os.remove(old_file_path)
            
        os.rename(new_file_path, old_file_path)

def ping(clients,inputs):
    for client in list(clients) :
        if clients[client]['connected']:
            try:
                client.send('!!ping\n'.encode())
            except:
                clients, inputs = remove_client(clients,inputs,client)
    return clients, inputs

def verif_args():
    if len(sys.argv) != 2:
        print("Mauvais nombre d'arguments. Veuillez utiliser le fichier tel que : chat_killer_server.py <Port>")
        sys.exit(1)
    try:
        port = int(sys.argv[1])
    except:
        print("Veuillez lancer le fichier en indiquant un nombre de port, comme par exemple 42024.")
        sys.exit(1)
    return port

def envoie_message(clients, message, envoyeur, destinataire):
    try:
        destinataire.send((message+'\n').encode())
    except AttributeError:
        if destinataire == "Admin":
            print(message)
    except:
        pseudo=clients[destinataire]['username']
        if envoyeur!="Admin" and envoyeur!="Serveur":                        
            envoyeur.send((f"Le message n'a pas pu être envoyé à l'utilisateur {pseudo}. Veuillez reéssayer.").encode())
        else:
            print(f"Le message n'a pas pu être envoyé à l'utilisateur {pseudo}. Veuillez reéssayer.")   

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

def pseudo_vers_socket(clients, pseudo):
    if pseudo=='Admin':
        return 'Admin'
    for client_socket, valeurs in clients.items():
        if valeurs['username'] == pseudo:
            return client_socket
    return None

def remove_client(clients, inputs, sock):
    username = clients[sock]['username']
    clients[sock]['connected']=False
    inputs.remove(sock)
    sock.close()
    print(f"Serveur: Le joueur {username} a été déconnecté.")
    for client in clients:
        if clients[client]['connected']:
                envoie_message(clients, f"Serveur: Le joueur {username} a quitté le Serveur.", 'Serveur', client)
    return clients, inputs

def liste(clients, user):
    envoie_message(clients,"Serveur: Voici la liste des joueurs :\nAdmin",'Serveur',user)
    for client in clients:
        if clients[client]["connected"]:
            connected="Connecté"
        else:
            connected="Déconnecté"
        envoie_message(clients, (f"{clients[client]['username']} : {clients[client]['status']} ; {connected}"),"Serveur", user)
        
def ban(clients, pseudos):
    for pseudo in pseudos:
        client_socket=pseudo_vers_socket(clients, pseudo)
        clients[client_socket]['status']='Mort'
        envoie_message(clients, "!ban", 'Admin', client_socket)
        for client in clients:
            if clients[client]['connected']:
                envoie_message(clients, f"Serveur: Le joueur {pseudo} a été tué.", 'Serveur', client)        
    return clients

def suspend(clients, pseudos):
    for pseudo in pseudos:
        client_socket=pseudo_vers_socket(clients, pseudo)
        envoie_message(clients, "!suspend", "Admin", client_socket)

def forgive(clients,pseudos):
    for pseudo in pseudos:
        client_socket=pseudo_vers_socket(clients, pseudo)
        envoie_message(clients, "!forgive", 'Admin', client_socket)

def verif_pseudos(clients, pseudos):
    for pseudo in pseudos:
        if pseudo_vers_socket(clients, pseudo)==None:
            return False
    return True

def choisir_pseudo(clients,sock,data):
    username = data.decode('utf-8', errors='replace')[:-1]
    for client in clients:
        if clients[client]['username']==username or username=='Admin' or username=='Serveur':
            envoie_message(clients,"Serveur: Le pseudo que vous avez choisi est interdit ou est déjà utilisé, veuillez en choisir un autre.",'Serveur',sock)
            username=None
            break
    clients[sock]['username'] = username
    if username!=None:
        for client in clients:
            if clients[client]['connected']:
                envoie_message(clients, (f"Serveur: Le joueur {username} a rejoint le chat."),'Serveur',client)
        print(f"Serveur: Le joueur à l'adresse {clients[client]['address']} a choisi le pseudo : {username}.")
    return clients
            
def traitement(clients, data, envoyeur):
    if envoyeur!='Admin':
        pseudo_envoyeur=clients[envoyeur]['username']        
        decoded_mss = data.decode('utf-8', errors = 'replace')[:-1]
    else:
        pseudo_envoyeur='Admin'
        decoded_mss=data

    pseudos, commande, message = diviser_message(decoded_mss)
    if not verif_pseudos(clients, pseudos):
        envoie_message(clients,"Serveur: Un des joueurs concernés par votre message n'existe pas, veuillez reéssayer.", 'Serveur', envoyeur)

    elif (decoded_mss=='!list'):
        liste(clients, envoyeur)

    elif (commande!=None):
        envoie_message(clients, "Serveur: Vous ne pouvez pas utiliser cette commande, la commande n'existe pas, ou vous avez mal écrit la commande.",'Serveur',envoyeur)

    elif (pseudos!=[] and commande==None):
        for pseudo_destinataire in pseudos:
            message_final = pseudo_envoyeur + " -> " + pseudo_destinataire + ": " + message
            destinataire=pseudo_vers_socket(clients, pseudo_destinataire)
            envoie_message(clients,message_final,envoyeur,destinataire)

    else:
        message_final = pseudo_envoyeur + " : " + message
        for client in clients:
            if clients[client]['connected']:
                envoie_message(clients,message_final,envoyeur,client)
        envoie_message(clients,message_final,envoyeur,"Admin")



        
if __name__ == "__main__":
    HOST = 'localhost'
    PORT = verif_args()
    SIZE_QUEUE = 5

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((HOST, PORT))
    server_socket.listen(SIZE_QUEUE)

    inputs = [server_socket, sys.stdin]
    clients = {}

    participants_jeu=[]

    if os.path.isfile('/var/tmp/killer.state'):
        with open('/var/tmp/killer.state', 'r') as file:
            for line in file:
                if line=='Participants:\n':
                    debut_partie=True
                    while line!='':
                        line=file.readline()[:-1]
                        participants_jeu.append(line)
                    break
    else:
        open('/var/tmp/killer.state', 'w').close()
        debut_partie=False

    last_time=time.time()
    while True:
        last_time=heartbeat(clients, participants_jeu, last_time)
        clients, inputs = ping(clients, inputs)
        read_sockets, _, _ = select.select(inputs, [], [], 1)
        for sock in read_sockets:
            if sock == server_socket:
                client_socket, client_address = server_socket.accept()
                inputs.append(client_socket)
                clients[client_socket] = {'address': client_address, 'username': None, 'status': 'Vivant', 'cookie': None, 'connected':True}                
                print(f"Serveur: Nouvelle connection depuis l'adresse : {client_address}.")                  
            elif sock == sys.stdin:
                data = sys.stdin.readline()[:-1]
                pseudos, commande, message = diviser_message(data)
                if not verif_pseudos(clients, pseudos):
                    envoie_message(clients,"Serveur: Un des joueurs concernés par votre message n'existe pas, veuillez reéssayer.", 'Serveur', 'Admin')
                if data=='!start':
                    if debut_partie==True:
                        print("Serveur: Vous avez déjà commencé la partie, veuillez effacer le fichier state et relancer le serveur avant d'en commencer une nouvelle.")
                    else:
                        debut_partie=True
                        with open('/var/tmp/killer.state','a') as file:
                            file.write("Participants:\n")
                            for client in clients:
                                file.write(str(clients[client]['cookie'])+'\n')
                                participants_jeu.append(str(clients[client]['cookie']))
                elif data == '!!exit':
                    for client in clients:
                        envoie_message(clients,'!!exit\n','Serveur',client)
                        envoie_message(clients,"Serveur: Le serveur ferme, merci d'avoir participé.",'Serveur',client)
                        client.close()
                    server_socket.shutdown(socket.SHUT_RDWR)
                    server_socket.close()
                    open('/var/tmp/killer.state','w').close()
                    sys.exit(0)
                elif pseudos!=[] and message == "":
                    if commande =='!ban':
                        clients = ban(clients,pseudos)
                    elif commande == '!suspend':
                        suspend(clients,pseudos)
                    elif commande == '!forgive':
                        forgive(clients,pseudos)
                else:
                    traitement(clients, data, 'Admin')
                
            else:
                data = sock.recv(MAX_BYTES)
                if data:
                    if debut_partie==True and clients[sock]['username'] is None:
                        if data.decode()[0:8]=='!!cookie':
                            cookie_recu=data.decode()[9:]
                            if cookie_recu not in participants_jeu:
                                envoie_message(clients,"Serveur: Vous ne participez pas à cette partie, vous allez être viré du serveur.",'Serveur',sock)
                                del clients[sock]
                                inputs.remove(sock)
                                sock.close()
                            else:
                                clients, _=reception_cookie(cookie_recu,clients,sock)
                        elif data.decode()=='!!non':
                            envoie_message(clients,"Serveur: Vous ne participez pas à cette partie, vous allez être viré du serveur.",'Serveur',sock)
                            del clients[sock]
                            inputs.remove(sock)
                            sock.close()
                        
                            
                    elif data.decode()[0:8]=='!!cookie':
                        cookie_recu=data.decode()[9:]
                        clients, nouveau=reception_cookie(cookie_recu,clients,sock)
                        if nouveau:
                            envoie_message(clients,"Serveur: Entrez votre pseudo dans le terminal fifo : ",'Serveur', sock)
                    elif data.decode()=='!!non':
                        envoie_message(clients,"Serveur: Entrez votre pseudo dans le terminal fifo : ",'Serveur', sock)   
                    elif clients[sock]['username'] is None:
                        clients = cookie_setup(clients, sock)                              
                        clients = choisir_pseudo(clients, sock, data)    
                    else:
                        traitement(clients, data, sock)