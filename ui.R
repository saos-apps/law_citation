library(shiny)
library(saos)

d3_visualisation <- function (outputId) 
{
  HTML(paste("<div id=\"", outputId, "\" class=\"shiny-network-output\"></div>", sep=""))
}

# Define UI for application that draws a histogram
shinyUI(fluidPage(
  fluidRow( id = "progressStatus",
    column(12,
           textOutput("console")
           )
    ),
  fluidRow( id = "menuContent",
    column(8,
      textInput(inputId = "query", label = h3("Wyszukaj orzeczenia"), value = "tulipany")
      ),
    column(4,
      titlePanel("Law citation network")
      )
    ),
  # d3 visualisation
  fluidRow(  id = "visContent",
    column(12,
      d3_visualisation(outputId = "visualisation")
      )
    # ,
   # column(4,
  #    h3("tbd"),
  #    fluidRow(id = "judgements"),
  #    fluidRow(id = "regulations")
  #  )
  ),

  # css and js
  tags$head(tags$link(rel = "stylesheet", type = "text/css", href = "css/style.css")),
  tags$head(tags$script(src="js/vis.js")),
  tags$head(tags$script(src="js/jquery.tipsy.js")),
  tags$head(tags$script(src="js/d3.min.js"))
  
))