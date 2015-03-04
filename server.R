library(shiny)

# Define server logic required to draw a histogram
shinyServer(function(input, output) {
  
  output$visualisation <- reactive({
    judgements <- search_judgments(all = input$query)
    judgements
  })
})