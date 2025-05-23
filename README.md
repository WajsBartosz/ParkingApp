# Deployment

## Requiremenets

* Terraform
* Azure CLI
* Azure Functions Core Tools
* Docker
* IoT Hub extension for Azure CLI

## How to deploy app

Download repository

    git clone https://github.com/WajsBartosz/ParkingApp.git

Navigate into IoT/terraform folder

Before running any script, be sure that you are logged into Azure CLI and you have exported Subscription ID. To do it type two commands
    
    az login
    export ARM_SUBSCRIPTION_ID=$(az account show --query id --output tsv)

After logged in, open main.tf in any text editor and add login and password mysql database in lines 27 and 28. After change it should look like this

    administrator_login    = "SQLDBAdmin"
    administrator_password = "Password123!"

Also change character coding by running command

    find . -type f -exec dos2unix {} \;

If you do not have it installed, you can install it via

    sudo apt install dos2unix

Now initiate terraform by

    terraform init

You can validate terraform file by

    terraform validate

If everything is correct, run command

    terraform apply -auto-approve

Type "yes", when you will be asked to confirm creation resources in azure

To add sensors run commands

    export SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
    bash post_deploy.sh

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

Once script is finished navigate into IoT Hub -> Hub settings -> Built-in endpoints and copy Event Hub-compatible endpoint string.
Once you copied it, navigate into function app -> Settings -> Environment variables and create new variable names

    IOTHUB_CONNECTION

and as a value paste a string that you copied in IoT Hub

# Parking app

Jesteśmy firmą która pracuje w biurze (około 30 biurek). Posiadamy do tego parking na 5 miejsc. Problem polega na tym, że mamy więcej chętnych osób do miejsc parkingowych niż iż rzeczywiście posiadamy.
Planujemy napisać aplikację, gdzie użytkownicy mogą zarezerować sobie danej miejsce w danym przedziale czasowym. Dodatkowo użylibyśmy czujników, które będą sprawdzać, czy rzeczywiście dana osoba zjawiła się na swoim zarezerwowanym miejscu. Jeżeli dana osoba nie zjawi się po około 30 minutach od startu rezerwacji to rezerwacja zostanie automatycznie usunięta, żeby inna osoba mogła zarezerwować sobie miejsce parkingowe.

## Przykład 1

Użytkownik mieszka w miejscowości oddalonej około 40km pod biurem, chce mieć pewność, że kiedy przyjedzie samochodem to będzie miał wolne miejsce parkingowe i nie będzie się musiał martwić o szukanie innego parkingu w pobliżu w momencie jak nasze miejsca parkingowe będa przepełnione.

## Przykład 2

Użytkownik zarezerwował sobie miejsce parkingowe na dzień dzisiejszy, ale z przyczyn prywatnych musiał anulować miejsce parkingowe, dzięki czemu ktoś inny będzie mógł je wykorzystać.

## Przykład 3

Użytkownik miał zarezerwowane miejsce, ale niestety coś mu wypadło i nie może przyjechać do biura. Zapomniał anulować swoją rezerwację przez co mamy puste "zajęte" miejsce parkingowe. System to wykryje dzięki czujnikowi i automatycznie anuluje rezerwacje.