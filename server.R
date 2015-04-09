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
    
    judgments <- isolate({ 
        query <- input$textQuery
        
        if (is.null(input$courtType) || input$courtType == "ALL")
          courtType <- NULL
        else
          courtType <- input$courtType
        
        if (is.null(input$judgmentType))
          judgmentType <- NULL
        else
          judgmentType <- input$judgmentType
        
        if (is.null(input$dateRange)) {
          judgmentDateFrom <- NULL
          judgmentDateTo <- NULL
        }
        else {
          judgmentDateFrom <- input$dateRange[1]
          judgmentDateTo <- input$dateRange[2]
        }
        
        search_judgments(all = input$textQuery, courtType = courtType, 
                         judgmentType = judgmentType, judgmentDateTo = judgmentDateTo,
                         judgmentDateFrom = judgmentDateFrom)
      })
    judgmentsDetails <- get_judgments(judgments)
    
    judgmentsDetails
  })
})