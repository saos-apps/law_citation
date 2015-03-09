library(shiny)

# Define server logic required to draw a histogram
shinyServer(function(input, output, session) {
  
  output$visualisation <- reactive({

    judgments <- search_judgments(all = input$query)
    judgmentsDetails <- get_judgments(judgments)
    
    judgmentsDetails
  })
})