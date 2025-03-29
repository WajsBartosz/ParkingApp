# Parking app

Jesteśmy firmą która pracuje w biurze (około 30 biurek). Posiadamy do tego parking na 5 miejsc. Problem polega na tym, że mamy więcej chętnych osób do miejsc parkingowych niż iż rzeczywiście posiadamy.
Planujemy napisać aplikację, gdzie użytkownicy mogą zarezerować sobie danej miejsce w danym przedziale czasowym. Dodatkowo użylibyśmy czujników, które będą sprawdzać, czy rzeczywiście dana osoba zjawiła się na swoim zarezerwowanym miejscu. Jeżeli dana osoba nie zjawi się po około 30 minutach od startu rezerwacji to rezerwacja zostanie automatycznie usunięta, żeby inna osoba mogła zarezerwować sobie miejsce parkingowe.

## Przykład 1

Użytkownik mieszka w miejscowości oddalonej około 40km pod biurem, chce mieć pewność, że kiedy przyjedzie samochodem to będzie miał wolne miejsce parkingowe i nie będzie się musiał martwić o szukanie innego parkingu w pobliżu w momencie jak nasze miejsca parkingowe będa przepełnione.

## Przykład 2

Użytkownik zarezerwował sobie miejsce parkingowe na dzień dzisiejszy, ale z przyczyn prywatnych musiał anulować miejsce parkingowe, dzięki czemu ktoś inny będzie mógł je wykorzystać.

## Przykład 3

Użytkownik miał zarezerwowane miejsce, ale niestety coś mu wypadło i nie może przyjechać do biura. Zapomniał anulować swoją rezerwację przez co mamy puste "zajęte" miejsce parkingowe. System to wykryje dzięki czujnikowi i automatycznie anuluje rezerwacje.