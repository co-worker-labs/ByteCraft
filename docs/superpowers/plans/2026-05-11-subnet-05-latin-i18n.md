# Subnet Calculator — Latin-Script Locale i18n Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add subnet tool translations for 5 Latin-script locales (es, pt-BR, fr, de, ru) and update tool cards + category references.

**Architecture:** All keys match `public/locales/en/subnet.json` exactly — only the values are translated. Latin-script locales do NOT include `searchTerms` per project convention (the `shortTitle` is already searchable by fuzzysort).

**Tech Stack:** JSON, next-intl

**Depends on:** Nothing (can run in parallel with Plans 01, 02, 03)

---

## File Structure

| File                                   | Action | Responsibility                                   |
| -------------------------------------- | ------ | ------------------------------------------------ |
| `public/locales/es/subnet.json`        | Create | Spanish tool-specific translations               |
| `public/locales/pt-BR/subnet.json`     | Create | Brazilian Portuguese tool-specific translations  |
| `public/locales/fr/subnet.json`        | Create | French tool-specific translations                |
| `public/locales/de/subnet.json`        | Create | German tool-specific translations                |
| `public/locales/ru/subnet.json`        | Create | Russian tool-specific translations               |
| `public/locales/es/tools.json`         | Modify | Add subnet tool card entry (no searchTerms)      |
| `public/locales/pt-BR/tools.json`      | Modify | Add subnet tool card entry (no searchTerms)      |
| `public/locales/fr/tools.json`         | Modify | Add subnet tool card entry (no searchTerms)      |
| `public/locales/de/tools.json`         | Modify | Add subnet tool card entry (no searchTerms)      |
| `public/locales/ru/tools.json`         | Modify | Add subnet tool card entry (no searchTerms)      |
| `public/locales/es/categories.json`    | Modify | Update reference section (5→6 tools, add subnet) |
| `public/locales/pt-BR/categories.json` | Modify | Update reference section (5→6 tools, add subnet) |
| `public/locales/fr/categories.json`    | Modify | Update reference section (5→6 tools, add subnet) |
| `public/locales/de/categories.json`    | Modify | Update reference section (5→6 tools, add subnet) |
| `public/locales/ru/categories.json`    | Modify | Update reference section (5→6 tools, add subnet) |

---

### Task 9: Latin-Script Locale i18n Files

**Files:**

- Create: `public/locales/es/subnet.json`
- Create: `public/locales/pt-BR/subnet.json`
- Create: `public/locales/fr/subnet.json`
- Create: `public/locales/de/subnet.json`
- Create: `public/locales/ru/subnet.json`
- Modify: `public/locales/es/tools.json`
- Modify: `public/locales/pt-BR/tools.json`
- Modify: `public/locales/fr/tools.json`
- Modify: `public/locales/de/tools.json`
- Modify: `public/locales/ru/tools.json`
- Modify: `public/locales/es/categories.json`
- Modify: `public/locales/pt-BR/categories.json`
- Modify: `public/locales/fr/categories.json`
- Modify: `public/locales/de/categories.json`
- Modify: `public/locales/ru/categories.json`

- [ ] **Step 1: Create `public/locales/es/subnet.json`**

```json
{
  "cidr": {
    "placeholder": "Introduce IP/CIDR (ej. 192.168.1.0/24)",
    "networkAddress": "Dirección de red",
    "broadcastAddress": "Dirección de broadcast",
    "firstHost": "Primer host utilizable",
    "lastHost": "Último host utilizable",
    "usableHosts": "Hosts utilizables",
    "totalHosts": "Total de direcciones",
    "subnetMask": "Máscara de subred",
    "cidrNotation": "Notación CIDR",
    "ipClass": "Clase IP",
    "addressType": "Tipo de dirección",
    "binaryView": "Vista binaria",
    "networkBits": "Bits de red",
    "hostBits": "Bits de host",
    "expand": "Expandir",
    "collapse": "Colapsar"
  },
  "ipCheck": {
    "title": "¿La IP pertenece a la subred?",
    "ip1": "Dirección IP 1",
    "ip2": "Dirección IP 2",
    "sameSubnet": "Misma subred",
    "differentSubnet": "Subred diferente"
  },
  "split": {
    "title": "Divisor de subredes",
    "parentCidr": "Red principal (CIDR)",
    "splitBy": "Dividir por",
    "bySubnetCount": "Número de subredes",
    "byHostCount": "Hosts por subred",
    "subnetCount": "Número de subredes",
    "hostCount": "Hosts por subred",
    "tooManyToVisualize": "Demasiadas subredes para mostrar visualmente",
    "tableHeaders": {
      "index": "#",
      "network": "Dirección de red",
      "broadcast": "Broadcast",
      "hostRange": "Rango de hosts",
      "usableHosts": "Hosts utilizables",
      "subnetMask": "Máscara de subred",
      "cidr": "CIDR"
    }
  },
  "vlsm": {
    "title": "Asignador VLSM",
    "parentCidr": "Red principal (CIDR)",
    "subnetName": "Nombre de subred",
    "requiredHosts": "Hosts requeridos",
    "addSubnet": "Añadir subred",
    "freeSpace": "Espacio libre",
    "deleteRow": "Eliminar"
  },
  "addressType": {
    "private": "Privada",
    "public": "Pública",
    "loopback": "Loopback",
    "linkLocal": "Link-Local",
    "multicast": "Multicast",
    "reserved": "Reservada"
  },
  "ipClass": {
    "a": "Clase A",
    "b": "Clase B",
    "c": "Clase C",
    "d": "Clase D (Multicast)",
    "e": "Clase E (Reservada)"
  },
  "descriptions": {
    "aeoDefinition": "La Calculadora de Subredes IP es una herramienta online gratuita para cálculo CIDR de IPv4/IPv6, división de subredes y asignación VLSM. Calcula dirección de red, broadcast, rango de hosts y máscara de subred completamente en tu navegador.",
    "whatIsTitle": "¿Qué es una Calculadora de Subredes?",
    "whatIs": "Una calculadora de subredes calcula las propiedades de red a partir de una entrada en notación CIDR. Determina la dirección de red, la dirección de broadcast, el rango de hosts utilizables y la máscara de subred para redes IPv4 e IPv6.",
    "useCasesTitle": "Casos de uso comunes",
    "useCasesDesc1": "Diseño de red",
    "useCasesP1": "Planifica la asignación de direcciones IP para subredes, determina prefijos CIDR apropiados para un número dado de hosts y verifica configuraciones de subred.",
    "useCasesDesc2": "Planificación VLSM",
    "useCasesP2": "Asigna máscaras de subred de longitud variable para usar eficientemente el espacio de direcciones cuando diferentes subredes tienen diferentes requerimientos de hosts.",
    "stepsTitle": "Cómo usar la Calculadora de Subredes",
    "step1Title": "Introduce una dirección CIDR",
    "step1Text": "Escribe una dirección IP con prefijo CIDR (ej. 192.168.1.0/24) para ver las propiedades de red incluyendo broadcast, rango de hosts y máscara de subred.",
    "step2Title": "Divide o asigna subredes",
    "step2Text": "Cambia a la pestaña Divisor de subredes para dividir una red en subredes iguales, o usa el Asignador VLSM para asignación de longitud variable.",
    "step3Title": "Copia los resultados",
    "step3Text": "Haz clic en el botón de copiar junto a cualquier campo de resultado para copiarlo al portapapeles.",
    "faq1Q": "¿Cuál es la diferencia entre /24 y /16?",
    "faq1A": "Una red /24 tiene 256 direcciones totales (254 hosts utilizables), mientras que una red /16 tiene 65.536 direcciones totales (65.534 hosts utilizables). La longitud del prefijo determina cuántos bits se usan para la porción de red — menos bits de host significa menos direcciones.",
    "faq2Q": "¿Por qué IPv6 no tiene dirección de broadcast?",
    "faq2A": "IPv6 eliminó el concepto de dirección de broadcast. En su lugar, IPv6 usa direcciones multicast para comunicación uno-a-muchos. La primera y última dirección en una subred IPv6 son ambas utilizables (excepto en enlaces punto a punto /127 según RFC 6164).",
    "faq3Q": "¿Qué es VLSM?",
    "faq3A": "VLSM (Variable Length Subnet Masking) permite dividir una red en subredes de diferentes tamaños. Esto es más eficiente que el subnetting de longitud fija porque cada subred recibe solo la cantidad de direcciones que necesita, reduciendo el desperdicio de espacio de direcciones."
  }
}
```

- [ ] **Step 2: Create `public/locales/pt-BR/subnet.json`**

```json
{
  "cidr": {
    "placeholder": "Insira IP/CIDR (ex. 192.168.1.0/24)",
    "networkAddress": "Endereço de rede",
    "broadcastAddress": "Endereço de broadcast",
    "firstHost": "Primeiro host utilizável",
    "lastHost": "Último host utilizável",
    "usableHosts": "Hosts utilizáveis",
    "totalHosts": "Total de endereços",
    "subnetMask": "Máscara de sub-rede",
    "cidrNotation": "Notação CIDR",
    "ipClass": "Classe IP",
    "addressType": "Tipo de endereço",
    "binaryView": "Visualização binária",
    "networkBits": "Bits de rede",
    "hostBits": "Bits de host",
    "expand": "Expandir",
    "collapse": "Recolher"
  },
  "ipCheck": {
    "title": "O IP pertence à sub-rede?",
    "ip1": "Endereço IP 1",
    "ip2": "Endereço IP 2",
    "sameSubnet": "Mesma sub-rede",
    "differentSubnet": "Sub-redes diferentes"
  },
  "split": {
    "title": "Divisor de sub-redes",
    "parentCidr": "Rede pai (CIDR)",
    "splitBy": "Dividir por",
    "bySubnetCount": "Número de sub-redes",
    "byHostCount": "Hosts por sub-rede",
    "subnetCount": "Número de sub-redes",
    "hostCount": "Hosts por sub-rede",
    "tooManyToVisualize": "Muitas sub-redes para exibição visual",
    "tableHeaders": {
      "index": "#",
      "network": "Endereço de rede",
      "broadcast": "Broadcast",
      "hostRange": "Faixa de hosts",
      "usableHosts": "Hosts utilizáveis",
      "subnetMask": "Máscara de sub-rede",
      "cidr": "CIDR"
    }
  },
  "vlsm": {
    "title": "Alocador VLSM",
    "parentCidr": "Rede pai (CIDR)",
    "subnetName": "Nome da sub-rede",
    "requiredHosts": "Hosts necessários",
    "addSubnet": "Adicionar sub-rede",
    "freeSpace": "Espaço livre",
    "deleteRow": "Excluir"
  },
  "addressType": {
    "private": "Privado",
    "public": "Público",
    "loopback": "Loopback",
    "linkLocal": "Link-Local",
    "multicast": "Multicast",
    "reserved": "Reservado"
  },
  "ipClass": {
    "a": "Classe A",
    "b": "Classe B",
    "c": "Classe C",
    "d": "Classe D (Multicast)",
    "e": "Classe E (Reservado)"
  },
  "descriptions": {
    "aeoDefinition": "A Calculadora de Sub-redes IP é uma ferramenta online gratuita para cálculo CIDR IPv4/IPv6, divisão de sub-redes e alocação VLSM. Calcula endereço de rede, broadcast, faixa de hosts e máscara de sub-rede inteiramente no seu navegador.",
    "whatIsTitle": "O que é uma Calculadora de Sub-redes?",
    "whatIs": "Uma calculadora de sub-redes computa as propriedades de rede a partir de uma entrada em notação CIDR. Ela determina o endereço de rede, endereço de broadcast, faixa de hosts utilizáveis e máscara de sub-rede para redes IPv4 e IPv6.",
    "useCasesTitle": "Casos de uso comuns",
    "useCasesDesc1": "Design de rede",
    "useCasesP1": "Planeje a alocação de endereços IP para sub-redes, determine prefixos CIDR adequados para determinada quantidade de hosts e verifique configurações de sub-rede.",
    "useCasesDesc2": "Planejamento VLSM",
    "useCasesP2": "Aloque máscaras de sub-rede de comprimento variável para usar eficientemente o espaço de endereçamento quando diferentes sub-redes têm diferentes necessidades de hosts.",
    "stepsTitle": "Como usar a Calculadora de Sub-redes",
    "step1Title": "Insira um endereço CIDR",
    "step1Text": "Digite um endereço IP com prefixo CIDR (ex. 192.168.1.0/24) para ver as propriedades da rede, incluindo broadcast, faixa de hosts e máscara de sub-rede.",
    "step2Title": "Divida ou aloque sub-redes",
    "step2Text": "Mude para a aba Divisor de sub-redes para dividir uma rede em sub-redes iguais, ou use o Alocador VLSM para alocação de comprimento variável.",
    "step3Title": "Copie os resultados",
    "step3Text": "Clique no botão de copiar ao lado de qualquer campo de resultado para copiá-lo para a área de transferência.",
    "faq1Q": "Qual a diferença entre /24 e /16?",
    "faq1A": "Uma rede /24 tem 256 endereços totais (254 hosts utilizáveis), enquanto uma rede /16 tem 65.536 endereços totais (65.534 hosts utilizáveis). O comprimento do prefixo determina quantos bits são usados para a porção de rede — menos bits de host significa menos endereços.",
    "faq2Q": "Por que o IPv6 não tem endereço de broadcast?",
    "faq2A": "O IPv6 eliminou o conceito de endereço de broadcast. Em vez disso, o IPv6 usa endereços multicast para comunicação um-para-muitos. O primeiro e o último endereço em uma sub-rede IPv6 são ambos utilizáveis (exceto em links ponto a ponto /127 conforme RFC 6164).",
    "faq3Q": "O que é VLSM?",
    "faq3A": "VLSM (Variable Length Subnet Masking) permite dividir uma rede em sub-redes de tamanhos diferentes. Isso é mais eficiente que o subnetting de comprimento fixo, pois cada sub-rede recebe apenas a quantidade de endereços necessária, reduzindo o desperdício de espaço de endereçamento."
  }
}
```

- [ ] **Step 3: Create `public/locales/fr/subnet.json`**

```json
{
  "cidr": {
    "placeholder": "Entrez l'IP/CIDR (ex. 192.168.1.0/24)",
    "networkAddress": "Adresse réseau",
    "broadcastAddress": "Adresse de diffusion",
    "firstHost": "Premier hôte utilisable",
    "lastHost": "Dernier hôte utilisable",
    "usableHosts": "Hôtes utilisables",
    "totalHosts": "Total des adresses",
    "subnetMask": "Masque de sous-réseau",
    "cidrNotation": "Notation CIDR",
    "ipClass": "Classe IP",
    "addressType": "Type d'adresse",
    "binaryView": "Vue binaire",
    "networkBits": "Bits réseau",
    "hostBits": "Bits hôte",
    "expand": "Développer",
    "collapse": "Réduire"
  },
  "ipCheck": {
    "title": "L'IP appartient-elle au sous-réseau ?",
    "ip1": "Adresse IP 1",
    "ip2": "Adresse IP 2",
    "sameSubnet": "Même sous-réseau",
    "differentSubnet": "Sous-réseaux différents"
  },
  "split": {
    "title": "Diviseur de sous-réseaux",
    "parentCidr": "Réseau parent (CIDR)",
    "splitBy": "Diviser par",
    "bySubnetCount": "Nombre de sous-réseaux",
    "byHostCount": "Hôtes par sous-réseau",
    "subnetCount": "Nombre de sous-réseaux",
    "hostCount": "Hôtes par sous-réseau",
    "tooManyToVisualize": "Trop de sous-réseaux pour un affichage visuel",
    "tableHeaders": {
      "index": "#",
      "network": "Adresse réseau",
      "broadcast": "Diffusion",
      "hostRange": "Plage d'hôtes",
      "usableHosts": "Hôtes utilisables",
      "subnetMask": "Masque de sous-réseau",
      "cidr": "CIDR"
    }
  },
  "vlsm": {
    "title": "Allocateur VLSM",
    "parentCidr": "Réseau parent (CIDR)",
    "subnetName": "Nom du sous-réseau",
    "requiredHosts": "Hôtes requis",
    "addSubnet": "Ajouter un sous-réseau",
    "freeSpace": "Espace libre",
    "deleteRow": "Supprimer"
  },
  "addressType": {
    "private": "Privée",
    "public": "Publique",
    "loopback": "Loopback",
    "linkLocal": "Link-Local",
    "multicast": "Multicast",
    "reserved": "Réservée"
  },
  "ipClass": {
    "a": "Classe A",
    "b": "Classe B",
    "c": "Classe C",
    "d": "Classe D (Multicast)",
    "e": "Classe E (Réservée)"
  },
  "descriptions": {
    "aeoDefinition": "Le Calculateur de Sous-réseaux IP est un outil en ligne gratuit pour le calcul CIDR IPv4/IPv6, le découpage de sous-réseaux et l'allocation VLSM. Calcule l'adresse réseau, la diffusion, la plage d'hôtes et le masque de sous-réseau entièrement dans votre navigateur.",
    "whatIsTitle": "Qu'est-ce qu'un calculateur de sous-réseaux ?",
    "whatIs": "Un calculateur de sous-réseaux détermine les propriétés réseau à partir d'une notation CIDR. Il calcule l'adresse réseau, l'adresse de diffusion, la plage d'hôtes utilisables et le masque de sous-réseau pour les réseaux IPv4 et IPv6.",
    "useCasesTitle": "Cas d'utilisation courants",
    "useCasesDesc1": "Conception réseau",
    "useCasesP1": "Planifiez l'allocation d'adresses IP pour les sous-réseaux, déterminez les préfixes CIDR appropriés selon le nombre d'hôtes et vérifiez les configurations de sous-réseaux.",
    "useCasesDesc2": "Planification VLSM",
    "useCasesP2": "Allouez des masques de sous-réseau à longueur variable pour utiliser efficacement l'espace d'adressage lorsque différents sous-réseaux ont des besoins en hôtes différents.",
    "stepsTitle": "Comment utiliser le calculateur de sous-réseaux",
    "step1Title": "Entrez une adresse CIDR",
    "step1Text": "Saisissez une adresse IP avec un préfixe CIDR (ex. 192.168.1.0/24) pour voir les propriétés réseau, y compris la diffusion, la plage d'hôtes et le masque de sous-réseau.",
    "step2Title": "Découpez ou allouez des sous-réseaux",
    "step2Text": "Passez à l'onglet Diviseur de sous-réseaux pour diviser un réseau en sous-réseaux égaux, ou utilisez l'Allocateur VLSM pour une allocation à longueur variable.",
    "step3Title": "Copiez les résultats",
    "step3Text": "Cliquez sur le bouton de copie à côté de n'importe quel champ de résultat pour le copier dans le presse-papiers.",
    "faq1Q": "Quelle est la différence entre /24 et /16 ?",
    "faq1A": "Un réseau /24 possède 256 adresses au total (254 hôtes utilisables), tandis qu'un réseau /16 en possède 65 536 (65 534 hôtes utilisables). La longueur du préfixe détermine le nombre de bits utilisés pour la partie réseau — moins de bits hôtes signifie moins d'adresses.",
    "faq2Q": "Pourquoi IPv6 n'a-t-il pas d'adresse de diffusion ?",
    "faq2A": "IPv6 a supprimé le concept d'adresse de diffusion (broadcast). À la place, IPv6 utilise des adresses multicast pour la communication un-à-plusieurs. La première et la dernière adresse d'un sous-réseau IPv6 sont toutes deux utilisables (sauf sur les liens point-à-point /127 selon la RFC 6164).",
    "faq3Q": "Qu'est-ce que VLSM ?",
    "faq3A": "VLSM (Variable Length Subnet Masking) permet de diviser un réseau en sous-réseaux de tailles différentes. C'est plus efficace que le sous-réseautage à longueur fixe car chaque sous-réseau reçoit uniquement le nombre d'adresses dont il a besoin, réduisant ainsi le gaspillage d'espace d'adressage."
  }
}
```

- [ ] **Step 4: Create `public/locales/de/subnet.json`**

```json
{
  "cidr": {
    "placeholder": "IP/CIDR eingeben (z.B. 192.168.1.0/24)",
    "networkAddress": "Netzwerkadresse",
    "broadcastAddress": "Broadcast-Adresse",
    "firstHost": "Erster nutzbarer Host",
    "lastHost": "Letzter nutzbarer Host",
    "usableHosts": "Nutzbare Hosts",
    "totalHosts": "Gesamtadressen",
    "subnetMask": "Subnetzmaske",
    "cidrNotation": "CIDR-Notation",
    "ipClass": "IP-Klasse",
    "addressType": "Adresstyp",
    "binaryView": "Binäransicht",
    "networkBits": "Netzwerkbits",
    "hostBits": "Hostbits",
    "expand": "Erweitern",
    "collapse": "Einklappen"
  },
  "ipCheck": {
    "title": "Gehört die IP zum Subnetz?",
    "ip1": "IP-Adresse 1",
    "ip2": "IP-Adresse 2",
    "sameSubnet": "Gleiches Subnetz",
    "differentSubnet": "Unterschiedliches Subnetz"
  },
  "split": {
    "title": "Subnetz-Aufteiler",
    "parentCidr": "Übergeordnetes Netzwerk (CIDR)",
    "splitBy": "Aufteilen nach",
    "bySubnetCount": "Anzahl der Subnetze",
    "byHostCount": "Hosts pro Subnetz",
    "subnetCount": "Anzahl der Subnetze",
    "hostCount": "Hosts pro Subnetz",
    "tooManyToVisualize": "Zu viele Subnetze für die visuelle Darstellung",
    "tableHeaders": {
      "index": "#",
      "network": "Netzwerkadresse",
      "broadcast": "Broadcast",
      "hostRange": "Host-Bereich",
      "usableHosts": "Nutzbare Hosts",
      "subnetMask": "Subnetzmaske",
      "cidr": "CIDR"
    }
  },
  "vlsm": {
    "title": "VLSM-Zuteiler",
    "parentCidr": "Übergeordnetes Netzwerk (CIDR)",
    "subnetName": "Subnetzname",
    "requiredHosts": "Benötigte Hosts",
    "addSubnet": "Subnetz hinzufügen",
    "freeSpace": "Freier Platz",
    "deleteRow": "Löschen"
  },
  "addressType": {
    "private": "Privat",
    "public": "Öffentlich",
    "loopback": "Loopback",
    "linkLocal": "Link-Local",
    "multicast": "Multicast",
    "reserved": "Reserviert"
  },
  "ipClass": {
    "a": "Klasse A",
    "b": "Klasse B",
    "c": "Klasse C",
    "d": "Klasse D (Multicast)",
    "e": "Klasse E (Reserviert)"
  },
  "descriptions": {
    "aeoDefinition": "Der IP-Subnetzrechner ist ein kostenloses Online-Tool für IPv4/IPv6-CIDR-Berechnung, Subnetz-Aufteilung und VLSM-Zuteilung. Berechnet Netzwerkadresse, Broadcast, Host-Bereich und Subnetzmaske vollständig in Ihrem Browser.",
    "whatIsTitle": "Was ist ein Subnetzrechner?",
    "whatIs": "Ein Subnetzrechner berechnet Netzwerkeigenschaften aus einer CIDR-Notationseingabe. Er ermittelt die Netzwerkadresse, Broadcast-Adresse, den nutzbaren Host-Bereich und die Subnetzmaske für IPv4- und IPv6-Netzwerke.",
    "useCasesTitle": "Häufige Anwendungsfälle",
    "useCasesDesc1": "Netzwerkdesign",
    "useCasesP1": "Planen Sie die IP-Adressenzuteilung für Subnetze, bestimmen Sie geeignete CIDR-Präfixe für gegebene Host-Anzahlen und überprüfen Sie Subnetz-Konfigurationen.",
    "useCasesDesc2": "VLSM-Planung",
    "useCasesP2": "Weisen Sie Subnetzmasken variabler Länge zu, um den Adressraum effizient zu nutzen, wenn verschiedene Subnetze unterschiedliche Host-Anforderungen haben.",
    "stepsTitle": "So verwenden Sie den Subnetzrechner",
    "step1Title": "CIDR-Adresse eingeben",
    "step1Text": "Geben Sie eine IP-Adresse mit CIDR-Präfix ein (z.B. 192.168.1.0/24), um Netzwerkeigenschaften einschließlich Broadcast, Host-Bereich und Subnetzmaske zu sehen.",
    "step2Title": "Subnetze aufteilen oder zuteilen",
    "step2Text": "Wechseln Sie zum Tab Subnetz-Aufteiler, um ein Netzwerk in gleiche Subnetze zu teilen, oder verwenden Sie den VLSM-Zuteiler für Zuteilung variabler Länge.",
    "step3Title": "Ergebnisse kopieren",
    "step3Text": "Klicken Sie auf die Kopier-Schaltfläche neben einem beliebigen Ergebnisfeld, um es in die Zwischenablage zu kopieren.",
    "faq1Q": "Was ist der Unterschied zwischen /24 und /16?",
    "faq1A": "Ein /24-Netzwerk hat 256 Gesamtadressen (254 nutzbare Hosts), während ein /16-Netzwerk 65.536 Gesamtadressen (65.534 nutzbare Hosts) hat. Die Präfixlänge bestimmt, wie viele Bits für den Netzwerkteil verwendet werden — weniger Host-Bits bedeutet weniger Adressen.",
    "faq2Q": "Warum hat IPv6 keine Broadcast-Adresse?",
    "faq2A": "IPv6 hat das Konzept der Broadcast-Adresse abgeschafft. Stattdessen verwendet IPv6 Multicast-Adressen für Eins-zu-vielen-Kommunikation. Die erste und letzte Adresse in einem IPv6-Subnetz sind beide nutzbar (außer auf /127-Punkt-zu-Punkt-Verbindungen gemäß RFC 6164).",
    "faq3Q": "Was ist VLSM?",
    "faq3A": "VLSM (Variable Length Subnet Masking) ermöglicht die Aufteilung eines Netzwerks in Subnetze unterschiedlicher Größe. Dies ist effizienter als Subnetting mit fester Länge, da jedes Subnetz nur die benötigte Anzahl an Adressen erhält und so Adressraum verschwendet wird."
  }
}
```

- [ ] **Step 5: Create `public/locales/ru/subnet.json`**

```json
{
  "cidr": {
    "placeholder": "Введите IP/CIDR (напр. 192.168.1.0/24)",
    "networkAddress": "Адрес сети",
    "broadcastAddress": "Широковещательный адрес",
    "firstHost": "Первый используемый хост",
    "lastHost": "Последний используемый хост",
    "usableHosts": "Используемые хосты",
    "totalHosts": "Всего адресов",
    "subnetMask": "Маска подсети",
    "cidrNotation": "Нотация CIDR",
    "ipClass": "Класс IP",
    "addressType": "Тип адреса",
    "binaryView": "Двоичный вид",
    "networkBits": "Биты сети",
    "hostBits": "Биты хостов",
    "expand": "Развернуть",
    "collapse": "Свернуть"
  },
  "ipCheck": {
    "title": "Принадлежит ли IP подсети?",
    "ip1": "IP-адрес 1",
    "ip2": "IP-адрес 2",
    "sameSubnet": "Одна подсеть",
    "differentSubnet": "Разные подсети"
  },
  "split": {
    "title": "Разделитель подсетей",
    "parentCidr": "Родительская сеть (CIDR)",
    "splitBy": "Разделить по",
    "bySubnetCount": "Количество подсетей",
    "byHostCount": "Хостов на подсеть",
    "subnetCount": "Количество подсетей",
    "hostCount": "Хостов на подсеть",
    "tooManyToVisualize": "Слишком много подсетей для визуального отображения",
    "tableHeaders": {
      "index": "#",
      "network": "Адрес сети",
      "broadcast": "Широковещательный",
      "hostRange": "Диапазон хостов",
      "usableHosts": "Используемые хосты",
      "subnetMask": "Маска подсети",
      "cidr": "CIDR"
    }
  },
  "vlsm": {
    "title": "Распределитель VLSM",
    "parentCidr": "Родительская сеть (CIDR)",
    "subnetName": "Имя подсети",
    "requiredHosts": "Требуемые хосты",
    "addSubnet": "Добавить подсеть",
    "freeSpace": "Свободное пространство",
    "deleteRow": "Удалить"
  },
  "addressType": {
    "private": "Частный",
    "public": "Публичный",
    "loopback": "Loopback",
    "linkLocal": "Link-Local",
    "multicast": "Multicast",
    "reserved": "Зарезервированный"
  },
  "ipClass": {
    "a": "Класс A",
    "b": "Класс B",
    "c": "Класс C",
    "d": "Класс D (Multicast)",
    "e": "Класс E (Зарезервированный)"
  },
  "descriptions": {
    "aeoDefinition": "Калькулятор IP-подсетей — бесплатный онлайн-инструмент для CIDR-расчётов IPv4/IPv6, разделения подсетей и распределения VLSM. Вычисляет адрес сети, широковещательный адрес, диапазон хостов и маску подсети полностью в браузере.",
    "whatIsTitle": "Что такое калькулятор подсетей?",
    "whatIs": "Калькулятор подсетей вычисляет свойства сети по нотации CIDR. Он определяет адрес сети, широковещательный адрес, диапазон используемых хостов и маску подсети для сетей IPv4 и IPv6.",
    "useCasesTitle": "Типичные сценарии использования",
    "useCasesDesc1": "Проектирование сети",
    "useCasesP1": "Планирование распределения IP-адресов по подсетям, определение подходящих CIDR-префиксов для заданного количества хостов и проверка конфигураций подсетей.",
    "useCasesDesc2": "Планирование VLSM",
    "useCasesP2": "Распределение масок подсетей переменной длины для эффективного использования адресного пространства, когда разные подсети имеют разные требования к количеству хостов.",
    "stepsTitle": "Как использовать калькулятор подсетей",
    "step1Title": "Введите CIDR-адрес",
    "step1Text": "Введите IP-адрес с CIDR-префиксом (напр. 192.168.1.0/24), чтобы увидеть свойства сети, включая широковещательный адрес, диапазон хостов и маску подсети.",
    "step2Title": "Разделите или распределите подсети",
    "step2Text": "Перейдите на вкладку «Разделитель подсетей» для деления сети на равные части или используйте «Распределитель VLSM» для распределения переменной длины.",
    "step3Title": "Скопируйте результаты",
    "step3Text": "Нажмите кнопку копирования рядом с любым полем результата, чтобы скопировать его в буфер обмена.",
    "faq1Q": "В чём разница между /24 и /16?",
    "faq1A": "Сеть /24 содержит 256 адресов (254 используемых хоста), а сеть /16 — 65 536 адресов (65 534 используемых хоста). Длина префикса определяет, сколько бит отводится под сетевую часть — меньше бит под хосты означает меньше адресов.",
    "faq2Q": "Почему в IPv6 нет широковещательного адреса?",
    "faq2A": "IPv6 отказался от концепции широковещательного адреса (broadcast). Вместо этого IPv6 использует multicast-адреса для связи «один-ко-многим». Первый и последний адрес в подсети IPv6 оба доступны для использования (кроме соединений точка-точка /127 согласно RFC 6164).",
    "faq3Q": "Что такое VLSM?",
    "faq3A": "VLSM (Variable Length Subnet Masking) позволяет делить сеть на подсети разного размера. Это эффективнее фиксированного разбиения, так как каждая подсеть получает только нужное количество адресов, что уменьшает потери адресного пространства."
  }
}
```

- [ ] **Step 6: Add subnet entry to all 5 `tools.json` files**

Insert the `"subnet"` entry after the `"bip39"` entry (before `"categories"`) in each file.

**es — `public/locales/es/tools.json`** (insert before `"categories"` at line 178):

```json
  "subnet": {
    "title": "Calculadora de Subredes IP - IPv4/IPv6 CIDR y VLSM",
    "shortTitle": "Calculadora de Subredes",
    "description": "Calculadora CIDR IPv4/IPv6 con divisor de subredes y asignador VLSM. Calcula dirección de red, broadcast, rango de hosts y máscara de subred — 100% del lado del cliente."
  },
```

**pt-BR — `public/locales/pt-BR/tools.json`** (insert before `"categories"` at line 178):

```json
  "subnet": {
    "title": "Calculadora de Sub-redes IP - IPv4/IPv6 CIDR e VLSM",
    "shortTitle": "Calculadora de Sub-redes",
    "description": "Calculadora CIDR IPv4/IPv6 com divisor de sub-redes e alocador VLSM. Calcula endereço de rede, broadcast, faixa de hosts e máscara de sub-rede — 100% no navegador."
  },
```

**fr — `public/locales/fr/tools.json`** (insert before `"categories"` at line 178):

```json
  "subnet": {
    "title": "Calculateur de Sous-réseaux IP - IPv4/IPv6 CIDR et VLSM",
    "shortTitle": "Calculateur de Sous-réseaux",
    "description": "Calculateur CIDR IPv4/IPv6 avec diviseur de sous-réseaux et allocateur VLSM. Calcule l'adresse réseau, la diffusion, la plage d'hôtes et le masque de sous-réseau — 100% côté client."
  },
```

**de — `public/locales/de/tools.json`** (insert before `"categories"` at line 178):

```json
  "subnet": {
    "title": "IP-Subnetzrechner - IPv4/IPv6 CIDR und VLSM",
    "shortTitle": "Subnetzrechner",
    "description": "IPv4/IPv6-CIDR-Rechner mit Subnetz-Aufteiler und VLSM-Zuteiler. Berechnet Netzwerkadresse, Broadcast, Host-Bereich und Subnetzmaske — 100% clientseitig."
  },
```

**ru — `public/locales/ru/tools.json`** (insert before `"categories"` at line 208):

```json
  "subnet": {
    "title": "Калькулятор IP-подсетей - IPv4/IPv6 CIDR и VLSM",
    "shortTitle": "Калькулятор подсетей",
    "description": "CIDR-калькулятор IPv4/IPv6 с разделителем подсетей и распределителем VLSM. Вычисляет адрес сети, широковещательный адрес, диапазон хостов и маску подсети — 100% в браузере."
  },
```

Note: None of the Latin-script locales include `searchTerms` per project convention. The `shortTitle` is already in Latin/Cyrillic script and fuzzysort matches directly.

- [ ] **Step 7: Update all 5 `categories.json` reference sections**

Replace the `"reference"` key in each locale's `categories.json`. Changes: 5→6 tools in `intro` and `faq1A`, add subnet tool mention to `title`, `description`, `intro`, and `faq1A`. Keep `faq2Q` and `faq2A` unchanged.

**es — `public/locales/es/categories.json`** (replace `"reference"` key):

```json
  "reference": {
    "title": "Herramientas de referencia y consulta - HTTP Status, ASCII, Códigos HTML, Subredes | OmniKit",
    "shortTitle": "Referencia y consulta",
    "description": "Herramientas gratuitas de referencia y consulta para desarrolladores. Códigos de estado HTTP, tabla ASCII, entidades HTML, visor SQLite, cliente HTTP y calculadora de subredes. Todas funcionan 100% en tu navegador.",
    "intro": "6 herramientas de referencia y consulta para búsquedas rápidas de desarrollo. Explora códigos de estado HTTP con referencias RFC, busca códigos de caracteres ASCII, codifica entidades HTML, explora bases de datos SQLite con un editor SQL, prueba APIs REST con el cliente HTTP y calcula subredes con la Calculadora de Subredes IP. Todas las herramientas son gratuitas y se ejecutan completamente en tu navegador.",
    "faq1Q": "¿Qué herramientas de referencia proporciona OmniKit?",
    "faq1A": "OmniKit ofrece 6 herramientas: referencia de Códigos de estado HTTP, Cliente HTTP para pruebas de API, Visor de bases de datos SQLite, Tabla ASCII, Codificador de entidades HTML y Calculadora de Subredes IP.",
    "faq2Q": "¿Puedo ejecutar consultas SQL en el visor de bases de datos?",
    "faq2A": "Sí. El visor SQLite soporta consultas SQL de solo lectura con autocompletado, historial de consultas, paginación y exportación a CSV o JSON, todo ejecutándose localmente en tu navegador mediante WebAssembly."
  }
```

**pt-BR — `public/locales/pt-BR/categories.json`** (replace `"reference"` key):

```json
  "reference": {
    "title": "Ferramentas de Referência e Consulta - HTTP Status, ASCII, Códigos HTML, Sub-redes | OmniKit",
    "shortTitle": "Referência e Consulta",
    "description": "Ferramentas online gratuitas de referência e consulta para desenvolvedores. Códigos de status HTTP, tabela ASCII, entidades HTML, visualizador SQLite, cliente HTTP e calculadora de sub-redes. Todas as ferramentas rodam 100% no seu navegador.",
    "intro": "6 ferramentas de referência e consulta para consultas rápidas de desenvolvimento. Navegue por códigos de status HTTP com referências RFC, consulte códigos de caracteres ASCII, codifique entidades HTML, explore bancos de dados SQLite com editor SQL, teste APIs REST com o cliente HTTP e calcule sub-redes com a Calculadora de Sub-redes IP. Todas as ferramentas são gratuitas e rodam inteiramente no seu navegador.",
    "faq1Q": "Quais ferramentas de referência o OmniKit oferece?",
    "faq1A": "O OmniKit oferece 6 ferramentas de referência: referência de Códigos de Status HTTP, Cliente HTTP para teste de APIs, Visualizador de Banco de Dados SQLite, Tabela ASCII, Codificador de Entidades HTML e Calculadora de Sub-redes IP.",
    "faq2Q": "Posso executar consultas SQL no Visualizador de DB?",
    "faq2A": "Sim. O Visualizador SQLite suporta consultas SQL somente leitura com autocompletar, histórico de consultas, paginação e exportação para CSV ou JSON — tudo rodando localmente no seu navegador via WebAssembly."
  }
```

**fr — `public/locales/fr/categories.json`** (replace `"reference"` key):

```json
  "reference": {
    "title": "Outils de référence et recherche — Statut HTTP, ASCII, Codes HTML, Sous-réseaux | OmniKit",
    "shortTitle": "Référence et recherche",
    "description": "Outils gratuits de référence et de recherche en ligne pour les développeurs. Codes de statut HTTP, table ASCII, entités HTML, visionneuse SQLite, client HTTP et calculateur de sous-réseaux. 100% côté client.",
    "intro": "6 outils de référence et de recherche pour des consultations rapides. Parcourir les codes de statut HTTP avec références RFC, consulter les codes de caractères ASCII, encoder les entités HTML, explorer les bases de données SQLite avec un éditeur SQL, tester les APIs REST avec le client HTTP et calculer des sous-réseaux avec le Calculateur de Sous-réseaux IP. Tous les outils sont gratuits et fonctionnent entièrement dans votre navigateur.",
    "faq1Q": "Quels outils de référence OmniKit propose-t-il ?",
    "faq1A": "OmniKit offre 6 outils de référence : Référence des codes de statut HTTP, Client HTTP pour tester des APIs, Visionneuse de base de données SQLite, Table ASCII, Encodeur d'entités HTML et Calculateur de Sous-réseaux IP.",
    "faq2Q": "Puis-je exécuter des requêtes SQL dans la visionneuse de base de données ?",
    "faq2A": "Oui. La visionneuse SQLite prend en charge les requêtes SQL en lecture seule avec auto-complétion, historique des requêtes, pagination et export en CSV ou JSON — le tout fonctionnant localement dans votre navigateur via WebAssembly."
  }
```

**de — `public/locales/de/categories.json`** (replace `"reference"` key):

```json
  "reference": {
    "title": "Referenz- und Nachschlagetools – HTTP-Status, ASCII, HTML-Codes, Subnetze | OmniKit",
    "shortTitle": "Referenz & Nachschlagewerk",
    "description": "Kostenlose Online-Referenz- und Nachschlagetools für Entwickler. HTTP-Statuscodes, ASCII-Tabelle, HTML-Entitäten, SQLite-Viewer, HTTP-Client und Subnetzrechner. Alle Tools laufen zu 100% in Ihrem Browser.",
    "intro": "6 Referenz- und Nachschlagetools für schnelle Entwickler-Recherchen. HTTP-Statuscodes mit RFC-Referenzen durchsuchen, ASCII-Zeichencodes nachschlagen, HTML-Entitäten kodieren, SQLite-Datenbanken mit einem SQL-Editor erkunden, REST-APIs mit dem HTTP-Client testen und Subnetze mit dem IP-Subnetzrechner berechnen. Alle Tools sind kostenlos und laufen vollständig in Ihrem Browser.",
    "faq1Q": "Welche Referenztools bietet OmniKit?",
    "faq1A": "OmniKit bietet 6 Referenztools: HTTP-Statuscodes-Referenz, HTTP-Client für API-Tests, SQLite-Datenbank-Viewer, ASCII-Tabelle, HTML-Entity-Kodierer und IP-Subnetzrechner.",
    "faq2Q": "Kann ich im DB-Viewer SQL-Abfragen ausführen?",
    "faq2A": "Ja. Der SQLite-Viewer unterstützt schreibgeschützte SQL-Abfragen mit Autovervollständigung, Abfrageverlauf, Paginierung und Export als CSV oder JSON — alles läuft lokal in Ihrem Browser über WebAssembly."
  }
```

**ru — `public/locales/ru/categories.json`** (replace `"reference"` key):

```json
  "reference": {
    "title": "Справочные инструменты — HTTP-статусы, ASCII, HTML-коды, Подсети | OmniKit",
    "shortTitle": "Справочники и поиск",
    "description": "Бесплатные справочные инструменты для разработчиков. Коды состояния HTTP, таблица ASCII, HTML-мнемоники, просмотрщик SQLite, HTTP-клиент и калькулятор подсетей. Все инструменты работают на 100% в браузере.",
    "intro": "6 справочных инструментов для быстрых запросов разработчика. Просмотр HTTP-кодов состояния со ссылками на RFC, таблица ASCII-кодов символов, кодирование HTML-мнемоник, исследование баз данных SQLite с SQL-редактором, тестирование REST API с HTTP-клиентом и расчёт подсетей с помощью Калькулятора IP-подсетей. Все инструменты бесплатные и работают полностью в браузере.",
    "faq1Q": "Какие справочные инструменты есть в OmniKit?",
    "faq1A": "OmniKit предлагает 6 справочных инструментов: справочник HTTP-кодов состояния, HTTP-клиент для тестирования API, просмотрщик баз данных SQLite, таблица ASCII, кодировщик HTML-мнемоник и Калькулятор IP-подсетей.",
    "faq2Q": "Можно ли выполнять SQL-запросы в просмотрщике БД?",
    "faq2A": "Да. Просмотрщик SQLite поддерживает SQL-запросы только для чтения с автодополнением, историей запросов, пагинацией и экспортом в CSV или JSON — всё работает локально в браузере через WebAssembly."
  }
```

- [ ] **Step 8: Commit**

```bash
git add public/locales/{es,pt-BR,fr,de,ru}/subnet.json public/locales/{es,pt-BR,fr,de,ru}/tools.json public/locales/{es,pt-BR,fr,de,ru}/categories.json
git commit -m "feat(subnet): add Latin-script locale translations (es, pt-BR, fr, de, ru)"
```
