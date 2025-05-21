# Deployment

## Requiremenets

* Terraform
* Azure CLI
* Azure Functions Core Tools
* Docker

## How to deploy app

Download repository

    git clone https://github.com/WajsBartosz/ParkingApp.git

Navigate into Deployment folder

Before running any script, be sure that you are logged into Azure CLI. To do it type
    
    az login

After logged in, open main.tf in any text editor and add login and password mysql database in lines 27 and 28. After change it should look like this

    administrator_login    = "SQLDBAdmin"
    administrator_password = "Password123!"

Now initiate terraform by

    terraform init

You can validate terraform file by

    terraform validate

If everything is correct, run command

    terraform apply

Type "yes", when you will be asked to confirm creation resources in azure

Once terraform is finished, navigate into Azure Container Registry -> Settings -> Access Keys. Here copy 

    Login server
    Username
    password

Once you copied all 3 strings type in your terminal window

    docker login "Login server" -u "Username" -p "password"

Once you are logged in to ACR, open pushWebApp.sh in text editor and add same login and password that you provided in terraform file in first two lines. It should look like this

    DB_USER="SQLDBAdmin"
    DB_PASSWORD="Password123!"

After changing password run bash script by command

    bash pushWebApp.sh

# Parking app

Jesteśmy firmą która pracuje w biurze (około 30 biurek). Posiadamy do tego parking na 5 miejsc. Problem polega na tym, że mamy więcej chętnych osób do miejsc parkingowych niż iż rzeczywiście posiadamy.
Planujemy napisać aplikację, gdzie użytkownicy mogą zarezerować sobie danej miejsce w danym przedziale czasowym. Dodatkowo użylibyśmy czujników, które będą sprawdzać, czy rzeczywiście dana osoba zjawiła się na swoim zarezerwowanym miejscu. Jeżeli dana osoba nie zjawi się po około 30 minutach od startu rezerwacji to rezerwacja zostanie automatycznie usunięta, żeby inna osoba mogła zarezerwować sobie miejsce parkingowe.

## Przykład 1

Użytkownik mieszka w miejscowości oddalonej około 40km pod biurem, chce mieć pewność, że kiedy przyjedzie samochodem to będzie miał wolne miejsce parkingowe i nie będzie się musiał martwić o szukanie innego parkingu w pobliżu w momencie jak nasze miejsca parkingowe będa przepełnione.

## Przykład 2

Użytkownik zarezerwował sobie miejsce parkingowe na dzień dzisiejszy, ale z przyczyn prywatnych musiał anulować miejsce parkingowe, dzięki czemu ktoś inny będzie mógł je wykorzystać.

## Przykład 3

Użytkownik miał zarezerwowane miejsce, ale niestety coś mu wypadło i nie może przyjechać do biura. Zapomniał anulować swoją rezerwację przez co mamy puste "zajęte" miejsce parkingowe. System to wykryje dzięki czujnikowi i automatycznie anuluje rezerwacje.