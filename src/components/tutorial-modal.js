import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useStyles } from "../../hooks/useStyles";

export default function TutorialModal({ visible, onClose, activeTab }) {
  const { styles, themeColors } = useStyles();

  // Contenuti del tutorial basati esclusivamente sulle funzionalità reali attuali dell'app
  const getTutorialContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return {
          title: "Guida Dashboard",
          subtitle: "La tua panoramica accademica attuale.",
          steps: [
            {
              icon: "grid-view",
              title: "Griglia delle Metriche reali",
              desc: "Visualizza all'istante il numero di corsi inseriti, esami superati, esami futuri da sostenere, progetti in scadenza o in ritardo, obiettivi orari completati e il conteggio delle ore di studio (previste vs effettive) per la settimana corrente."
            },
            {
              icon: "show-chart",
              title: "Grafico dell'Andamento",
              desc: "Monitora graficamente le tue ore complessive dedicate allo studio nell'arco degli ultimi 7 giorni tramite un diagramma ad andamento lineare."
            },
            {
              icon: "event-note",
              title: "Esami Imminenti",
              desc: "Un riepilogo rapido che elenca i prossimi tre esami più vicini nel tempo con la loro priorità, offrendo una scorciatoia rapida per andare alla lista esami."
            },
            {
              icon: "analytics",
              title: "Distribuzione Oraria",
              desc: "Guarda la ripartizione percentuale delle ore settimanali effettivamente dedicate a ciascun corso specifico tramite barre di progresso orizzontali."
            },
            {
              icon: "tips-and-updates",
              title: "Suggerimento Automatico",
              desc: "Se hai un esame critico a priorità alta molto vicino, la Dashboard ti propone un suggerimento mirato e ti consente di creare istantaneamente un'attività di ripasso per il giorno successivo premendo 'Crea attività'."
            }
          ]
        };
      case "Corsi":
        return {
          title: "Guida Corsi",
          subtitle: "Pianifica e controlla il tuo piano di studi.",
          steps: [
            {
              icon: "add-box",
              title: "Creazione e Modifica",
              desc: "Aggiungi corsi indicando Nome, Titolo (Prof. o Prof.ssa), Nome Docente, Semestre, Anno, Crediti (da 1 a 20 CFU), Data di fine, Voto desiderato e Voto ottenuto (se superato), assieme a note e materiali di studio."
            },
            {
              icon: "filter-alt",
              title: "Filtri Multilivello",
              desc: "Filtra all'istante l'elenco dei corsi per Stato (Da iniziare, In corso, Completato, Superato), Semestre (1° o 2° semestre) o Anno accademico (dal 1° al 6° anno)."
            },
            {
              icon: "sort-by-alpha",
              title: "Ordinamento e Ricerca",
              desc: "Ordina i corsi per Nome o per Crediti (CFU) in modalità crescente o decrescente e cercali scrivendone il nome nella barra di ricerca."
            },
            {
              icon: "delete-sweep",
              title: "Eliminazione Sicura",
              desc: "Elimina un corso in sicurezza: l'applicazione ti avvertirà che l'eliminazione rimuoverà anche tutti gli esami, gli obiettivi e le attività del planner correlati."
            }
          ]
        };
      case "Esami":
        return {
          title: "Guida Esami",
          subtitle: "Gestisci esami, consegne e voti.",
          steps: [
            {
              icon: "library-add",
              title: "Inserimento Esami e Scadenze",
              desc: "Crea esami definendo Titolo, Corso associato, Data di svolgimento, Tipo (Scritta, Orale, Intracorso, Consegna, Idoneità, Altro), Priorità (Alta, Media, Bassa) e Note."
            },
            {
              icon: "tab",
              title: "Divisione in Categorie",
              desc: "Visualizza gli esami divisi per schede: Da svolgere, Da consegnare, In ritardo (per consegne scadute) o Svolti."
            },
            {
              icon: "date-range",
              title: "Filtro Date ed Esito",
              desc: "Filtra gli esami per un periodo temporale specifico (Da/A) con calendario integrato."
            },
            {
              icon: "assignment-turned-in",
              title: "Registrazione del Voto",
              desc: "Segna un esame come Superato e inserisci il voto (da 18 a 30L o Idoneità). L'app ti chiederà se vuoi impostarlo come voto finale del corso associato, aggiornando automaticamente lo stato del corso e gestendo eventuali conflitti se esisteva già un voto."
            },
            {
              icon: "forward",
              title: "Integrazione col Planner",
              desc: "Usa l'azione 'Vai al Planner' su qualsiasi esame per aprire direttamente la scheda di creazione attività del planner con i dati dell'esame già precompilati."
            }
          ]
        };
      case "Planner":
        return {
          title: "Guida Planner",
          subtitle: "Programma le sessioni di studio nel tempo.",
          steps: [
            {
              icon: "view-week",
              title: "Vista Settimanale vs Lista",
              desc: "Passa dalla modalità 'Settimanale' (calendario orizzontale a 7 giorni navigabile per programmare visivamente le attività) alla modalità 'Lista' (elenco lineare completo di tutte le sessioni)."
            },
            {
              icon: "more-time",
              title: "Nuova Attività e Vincoli",
              desc: "Aggiungi sessioni indicando Nome, Corso/Esame/Obiettivo collegati, Date di inizio e fine, Tipo (Studio, Ripasso, Esercitazione, ecc.), Priorità e Ore/Minuti previsti ed effettivi. La data di fine non può essere antecedente a quella di inizio e le ore non possono superare le 24 giornaliere. Non puoi pianificare attività in date passate."
            },
            {
              icon: "done-all",
              title: "Completamento Attività",
              desc: "Spunta il selettore per completare un'attività. Non è permesso completare attività pianificate nel futuro. Il tempo effettivo svolto andrà ad aggiornare automaticamente i progressi degli obiettivi e del grafico settimanale."
            },
            {
              icon: "filter-list-alt",
              title: "Ricerca, Filtri e Ordinamento",
              desc: "Filtra le attività per priorità, periodo temporale (Future, Passate) e ordinale per Nome, Data di inserimento o Corso (crescente/decrescente)."
            }
          ]
        };
      case "Obiettivi":
        return {
          title: "Guida Obiettivi",
          subtitle: "Fissa traguardi orari per i tuoi corsi.",
          steps: [
            {
              icon: "outlined-flag",
              title: "Definizione degli Obiettivi",
              desc: "Crea obiettivi specificando Titolo, Descrizione, Corso di riferimento, Periodo temporale (inizio/fine con controllo di validità), Priorità e stima delle Ore previste da dedicare allo studio e le ore effettivamente svolte con alcune note di cui si vuole tenere traccia."
            },
            {
              icon: "hourglass-full",
              title: "Barra di Progresso",
              desc: "Monitora visivamente l'avanzamento orario reale rispetto alle ore stimate tramite una barra colorata che si aggiorna automaticamente in base allo studio reale svolto."
            },
            {
              icon: "check-circle-outline",
              title: "Stato dell'Obiettivo",
              desc: "Segna rapidamente l'obiettivo come completato o riaprilo per continuare a tracciare le ore. Si completa in automatico al raggiungimento delle ore stimate."
            },
            {
              icon: "filter-list",
              title: "Filtri e Ordinamento",
              desc: "Cerca i tuoi obiettivi per parola chiave, filtrali per priorità o corso associato, mostra o nascondi i completati e ordinali per Nome o Corso."
            }
          ]
        };
      case "Pomodoro":
        return {
          title: "Guida Pomodoro ⏱️",
          subtitle: "Ottimizza il tempo con cicli di studio e pausa.",
          steps: [
            {
              icon: "play-circle-outline",
              title: "Cicli di Studio e Pausa",
              desc: "Avvia o metti in pausa il timer. Puoi passare manualmente dallo stato 'Studio' (arancione) allo stato 'Pausa' (verde) in qualsiasi momento."
            },
            {
              icon: "donut-large",
              title: "Visualizzazione circolare",
              desc: "Osserva la miccia circolare che si accorcia progressivamente man mano che il tempo scorre, con il minutaggio preciso."
            },
            {
              icon: "link",
              title: "Associazione all'Attività",
              desc: "Associa il timer a un'attività pianificata per oggi (dal tuo Planner). Al completamento di una sessione di studio, i minuti definiti nelle impostazioni verranno sommati automaticamente alle ore svolte per quell'attività e sul relativo obiettivo."
            },
            {
              icon: "restore-page",
              title: "Ripristina e Recupero",
              desc: "Premendo 'Ripristina' mentre il timer è in esecuzione, l'app calcola i minuti di studio effettivi fino a quel momento e ti chiede se vuoi salvarli comunque sull'attività del planner o scartarli."
            },
            {
              icon: "settings-applications",
              title: "Impostazioni Personalizzate",
              desc: "Usa l'icona dell'ingranaggio in alto a destra per inserire la durata in minuti preferita sia per lo studio che per la pausa (fino a 60 minuti). La descrizione in fondo a questa pagina si adatterà all'istante mostrando i minuti selezionati."
            }
          ]
        };
      default:
        return {
          title: "Study Planner Tutorial 🎓",
          subtitle: "La tua applicazione per lo studio efficiente.",
          steps: [
            {
              icon: "stars",
              title: "Benvenuto!",
              desc: "Usa le schede di navigazione in basso per spostarti tra le varie sezioni o il pulsante arancione del timer in basso a destra."
            }
          ]
        };
    }
  };

  const content = getTutorialContent();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalSheet, { maxHeight: "85%" }]}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: themeColors.textTitle, flexShrink: 1 }}>
                {content.title}
              </Text>
              <Text style={[styles.bodyText, { fontSize: 13, color: themeColors.textMuted, marginBottom: 0, marginTop: 2 }]}>
                {content.subtitle}
              </Text>
            </View>
            <Pressable style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseIcon}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={{ gap: 14, marginVertical: 8 }}>
              {content.steps.map((step, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.panel,
                    {
                      marginBottom: 0,
                      flexDirection: "row",
                      gap: 14,
                      alignItems: "flex-start",
                      padding: 14,
                      backgroundColor: themeColors.surfaceAlt,
                      borderColor: themeColors.border,
                      borderWidth: 1
                    }
                  ]}
                >
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      backgroundColor: themeColors.primaryLight,
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 2
                    }}
                  >
                    <MaterialIcons name={step.icon} size={20} color={themeColors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.panelTitle, { fontSize: 15, marginBottom: 4 }]}>
                      {step.title}
                    </Text>
                    <Text style={[styles.bodyText, { fontSize: 13, marginBottom: 0, lineHeight: 18 }]}>
                      {step.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <Pressable style={[styles.primaryButton, { marginTop: 16 }]} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Ho capito, grazie!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
