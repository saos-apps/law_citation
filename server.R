library(shiny)

# Define server logic required to draw a histogram
shinyServer(function(input, output, session) {
  
  output$visualisation <- reactive({
    # creating a dependency on action button
    input$searchQuery
    
    progress <- shiny:::Progress$new(session, min=1, max=15)
    on.exit(progress$close())
    
    progress$set(message = 'Pobieranie danych z API...')
    for (i in 1:15) {
      progress$set(value = i)
      Sys.sleep(0.5)
    }
    
    judgments <- isolate(search_judgments(all = input$textQuery))
    judgmentsDetails <- get_judgments(judgments)
    
    judgmentsDetails
  })
})