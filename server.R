library(shiny)

# Define server logic required to draw a histogram
shinyServer(function(input, output) {
  
  output$visualisation <- reactive({
    judgments <- search_judgments(all = input$query)
    judgments <- get_judgments(judgments)
    judgments
  })
})