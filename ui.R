library(shiny)
library(saos)

d3_visualisation <- function (outputId) 
{
  HTML(paste("<div id=\"", outputId, "\" class=\"shiny-network-output\"></div>", sep=""))
}

# Define UI for application that draws a histogram
shinyUI(fluidPage(
  # d3 visualisation
  fluidRow(id = "visContent",
    column(9,
      d3_visualisation(outputId = "visualisation")
      ),
    column(3,
      fluidRow(id = "progressBarRow"),
      fluidRow(id = "menu",
              textInput(inputId = "textQuery", label = h4("Wyszukaj orzeczenia"), 
                        value = "tulipany"),
              actionButton(inputId = "addQuery", label = "Dodatkowe pola wyszukiwania")
      ),
      hr(),
      fluidRow(id = "additionalQuery", hidden = "TRUE",
              dateRangeInput(inputId = "dateRange", label = "Zakres dat orzeczeń", 
                             start = "2000-01-01", end = NULL, min = NULL, max = NULL, 
                             format = "dd-mm-yyyy", language = "pl", separator = " do "),
              checkboxGroupInput("judgmentType", label = "Rodzaj orzeczenia", 
                                 choices = list("Postanowienie" = "DECISION", "Wyrok" = "SENTENCE", "Uzasadnienie" = "REASONS",
                                                "Uchwała" = "RESOLUTION", "Zarządzenie" = "REGULATION"),
                                 selected = NULL),
              radioButtons("courtType", label = "Organ orzekający",
                           choices = list("Wszystkie" = "ALL", "Sąd najwyższy" = "SUPREME", 
                                          "Krajowa Izba Odwoławcza" = "NATIONAL_APPEAL_CHAMBER", "Sąd powszechny" = "COMMON",
                                          "Trybunał Konstytucyjny" = "CONSTITUTIONAL_TRIBUNAL"), 
                           selected = "ALL")
      ),
      fluidRow(id = "searchRow",
               actionButton(inputId = "searchQuery", label = "Wyszukaj")
      ),
      hr(),
      fluidRow(id = "legend",
               h4("Legenda"),
               div(id = "legendTable",
                   HTML('<p><span style="color:#bcbd22">&#11044</span> Akty prawne<p>'),
                   HTML('<p><span style="color:#ff7f0e">&#11044</span> Orzeczenia</p>')
               )
      ),
      fluidRow(id = "sidebarPanel",
               h4("Szczegółowe informacje"),
               div(id = "highlightedNode"),
               div(id = "allNodes")
      )
    )
      #),
      
    # ,
   # column(4,
  #    h3("tbd"),
  #    fluidRow(id = "judgements"),
  #    fluidRow(id = "regulations")
  #  )
  ),

  # css and js
  tags$script("$('#addQuery').click(function() {
    $('#additionalQuery').toggle();
  });"),
  tags$head(tags$link(rel = "stylesheet", type = "text/css", href = "css/style.css")),
  tags$head(tags$script(src="js/vis.js")),
  tags$head(tags$script(src="js/jquery.tipsy.js")),
  tags$head(tags$script(src="js/d3.min.js"))
  
))