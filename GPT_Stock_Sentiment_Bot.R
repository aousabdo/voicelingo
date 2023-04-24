# library(jsonlite)
# library(httr)
# 
# api.token='6443f31477c8c3.53805265'
# 
# symbol <- "HUT"
# 
# ticker.link <- paste("https://eodhistoricaldata.com/api/news?api_token=", api.token, "&s="
#              , symbol,".US&&limit=100", sep = "")
# 
# response <- GET(ticker.link)
# 
# response_content <- fromJSON(content(response, "text"))


library(httr)
library(jsonlite)
library(lubridate)

get_news_headlines_for_companies <- function(companies
                                             , EOD_API_KEY
                                             , apply_day_filters = TRUE) {
  
  if(!is.list(companies)) stop("companies must be a named list: list('AAPL' = 'Apple', 'MSFT' = 'Microsoft')")
  headlines <- list()
  
  for (i in seq_along(companies)) {
    symbol <- names(companies)[i]
    name   <- companies[[i]]
    
    url <- paste0("https://eodhistoricaldata.com/api/news?api_token=", EOD_API_KEY, "&s=", symbol, ".US&&limit=2")
    
    response <- GET(url)
    
    if (http_type(response) == "application/json") {
      all_headlines <- fromJSON(content(response, "text", encoding = "UTF-8"), simplifyVector = FALSE)
    } else {
      cat(paste("Error decoding JSON for", name, ":", content(response, "text", encoding = "UTF-8"), "\n"))
      all_headlines <- list()
    }
    
    est <- "US/Eastern"
    utc <- "UTC"
    
    start_time <- with_tz(ymd_hms(yesterday_9am_est()), est) %>% with_tz(utc)
    end_time   <- with_tz(ymd_hms(today_9am_est()), est) %>% with_tz(utc)
    
    all_headlines <- all_headlines
    
    if(apply_day_filters){
      true_false <- lapply(all_headlines, function(x) {
        date <- ymd_hms(x[["date"]])
        date >= start_time & date <= end_time
      }) %>% 
        unlist
      
      filtered_headlines <- all_headlines[true_false]
    }else{
      filtered_headlines <- all_headlines
    }
    
    headlines[[name]] <- filtered_headlines
  }
  
  return(headlines)
}


library(lubridate)

yesterday_9am_est <- function() {
  est       <- "US/Eastern"
  now_est   <- with_tz(Sys.time(), est)
  yesterday <- now_est - days(1)
  return(format(update(yesterday, hours = 9, minutes = 31, seconds = 0), "%Y-%m-%d %H:%M:%S"))
}

today_9am_est <- function() {
  est     <- "US/Eastern"
  now_est <- with_tz(Sys.time(), est)
  return(format(update(now_est, hours = 9, minutes = 25, seconds = 0), "%Y-%m-%d %H:%M:%S"))
}




