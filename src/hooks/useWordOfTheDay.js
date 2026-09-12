import { useState, useEffect } from 'react';
import { wordOfTheDayService } from '../services/wordOfTheDay';

export const useWordOfTheDay = () => {
  const [wordOfTheDay, setWordOfTheDay] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWordOfTheDay = async () => {
      setIsLoading(true);
      try {
        const wotd = await wordOfTheDayService.fetchWordOfTheDay();
        setWordOfTheDay(wotd);
      } catch (error) {
        console.error('Error fetching word of the day:', error);
        // This should not happen as the service has fallbacks, but just in case
        setWordOfTheDay({
          word: 'explore',
          definition: 'To investigate or travel through',
          example: "Let's explore new vocabulary together",
          partOfSpeech: 'verb',
          source: 'emergency-fallback',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWordOfTheDay();
  }, []);

  return { wordOfTheDay, isLoading };
};
