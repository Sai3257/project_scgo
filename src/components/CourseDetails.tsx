import { useEffect, useState } from 'react';
import { fetchCourseDetails, markTaskAsCompleted } from '../api/endpoints';
import { CheckCircle, Clock, AlertTriangle, Target, TrendingUp, Zap, BookOpen, Trophy, Home, Star } from 'lucide-react';
import Leaderboard from './Leaderboard';
import PointsPage from './PointsPage';

type FilterType = 'all' | 'completed' | 'pending' | 'stuck';
type NavigationTab = 'home' | 'tasks' | 'points' | 'rankings';

interface Task {
  id: number;
  title: string;
  description: string;
  contentLinks?: string[];
  videoLinks?: string[];
  dueDate?: string;
  completionDate?: string;
  status: 'completed' | 'pending' | 'stuck';
  points: number;
  moduleId: number;
}

interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
  tasks: Task[];
}

interface Course {
  id: number;
  title: string;
  version: number;
  modules: Module[];
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  stuckTasks: number;
  totalPoints: number;
  earnedPoints: number;
}

const aiChallengeCourse: Course = {
  id: 53,
  title: '21 Day AI Challenge',
  version: 1,
  modules: [
    {
      id: 1,
      title: 'AI Activate',
      description: 'Module 1: AI Activate',
      order: 1,
      tasks: [
        {
          id: 1,
          title: 'Life Coach',
          description: '1. Open New Chat in ChatGPT and submit the prompt\n2. AI will ask you one question at a time which you can answer\n3. Discuss as long as need to get the clarity on the goal\nShare your learnings with the community and confirm to me when done.',
          videoLinks: ['https://youtube.com/watch?v=life-coach'],
          status: 'pending',
          points: 50,
          moduleId: 1
        },
        {
          id: 2,
          title: 'Daily Planner',
          description: '1. Open New Chat in ChatGPT and submit the prompt\n2. AI will ask you one questions about your daily activity\n3. Discuss as long as need to get the clarity on your routine\nShare your time saved with the new schedule with the community and confirm back to me when done.',
          videoLinks: ['https://youtube.com/watch?v=daily-planner'],
          status: 'pending',
          points: 50,
          moduleId: 1
        },
        {
          id: 3,
          title: 'Writing Assistant',
          description: '1. Open New Chat in ChatGPT and click on the speaker icon\n2. Explain what you want chatgpt to write about and give clarity\n3. Add more clarity and context if the response is not good enough\n4. Share the email copy it generated with the community and confirm to me when it\'s done.',
          videoLinks: ['https://youtube.com/watch?v=writing-assistant'],
          status: 'pending',
          points: 50,
          moduleId: 1
        },
        {
          id: 4,
          title: 'Learning Friend',
          description: '1. Open New Chat in ChatGPT and write your question\n2. Make it easier to understand by adding "answer to a 5th grade"\n3. Discuss as long as need to get the clarity on the subject\n4. Share what you learned in the group and confirm to me when it\'s done.',
          videoLinks: ['https://youtube.com/watch?v=learning-friend'],
          status: 'pending',
          points: 50,
          moduleId: 1
        },
        {
          id: 5,
          title: 'Speed Grasper',
          description: '1. Identify the content to summarise (document, video, pdf)\n2. Upload it to your fav tool and ask for a detailed summary\n3. Dig deeper asking more detailed questions\nShare the time you saved from the video you summarised in the group and confirm back to me when done.',
          videoLinks: ['https://youtube.com/watch?v=speed-grasper'],
          status: 'pending',
          points: 50,
          moduleId: 1
        },
        {
          id: 6,
          title: 'Question of the Week',
          description: '1. Review the past week\n2. Ask your question (if any)\n3. Confirm back to your supercoach\nShare your biggest takeaway or question with the community and confirm back to me when done.',
          videoLinks: ['https://youtube.com/watch?v=question-week'],
          status: 'pending',
          points: 50,
          moduleId: 1
        },
        {
          id: 7,
          title: 'Talk about your AI Journey with someone who doesn\'t know',
          description: '1. Identify 1-3 friends/colleague you love to connect\n2. Connect with them via chat or phone or in person\n3. Share your excitement or experience of learning AI with them\nShare who did you talk about AI with in the group and confirm back to me when done.',
          videoLinks: ['https://youtube.com/watch?v=ai-journey'],
          status: 'pending',
          points: 50,
          moduleId: 1
        }
      ]
    },
    {
      id: 2,
      title: 'AI Amplify',
      description: 'Module 2: AI Amplify',
      order: 2,
      tasks: [
        {
          id: 8,
          title: 'Relationship Coach',
          description: '1. Identify the person, relationship, situation and goal\n2. Discuss and debate the ideas shared and pick the one\n3. Execute the choosen one and see the reaction\nConfirm back to me when done.',
          videoLinks: ['https://youtube.com/watch?v=relationship-coach'],
          status: 'pending',
          points: 50,
          moduleId: 2
        },
        {
          id: 9,
          title: 'Prep Buddy',
          description: '1. Feed AI with the situation, the other person and dynamics\n2. Play along and see how the situation pans out\n3. Learn from the experience and be prepared for the interaction\nShare your one big learning with the community and confirm back to me when done.',
          videoLinks: ['https://youtube.com/watch?v=prep-buddy'],
          status: 'pending',
          points: 50,
          moduleId: 2
        },
        {
          id: 10,
          title: 'Supportive Critic',
          description: '1. Feed your output, context and ask AI to critic\n2. In advanced mode, give what is expected (e.g. job description) and your current work (e.g. resume) and ask for step by step feedback\n3. Assess the feedback for its usefulness and use it next time you want your work reviewed\nShare your one big learning with the community and confirm back to me when done.',
          videoLinks: ['https://youtube.com/watch?v=supportive-critic'],
          status: 'pending',
          points: 50,
          moduleId: 2
        },
        {
          id: 11,
          title: 'Creative Amplifier',
          description: '1. Create a song using chatgpt on your favourite topic\n2. Make it sing using the AI tool provided\n3. Complete the work and share the song you have created\nShare your one big learning with the community and confirm back to me when done.',
          videoLinks: ['https://youtube.com/watch?v=creative-amplifier'],
          status: 'pending',
          points: 50,
          moduleId: 2
        },
        {
          id: 12,
          title: 'Research Assistant',
          description: '1. Identify a topic you want to research\n2. Use AI to gather comprehensive information\n3. Analyze and synthesize the findings\n4. Share your research insights with the community and confirm back to me when done.',
          videoLinks: ['https://youtube.com/watch?v=research-assistant'],
          status: 'pending',
          points: 50,
          moduleId: 2
        }
      ]
    },
    {
      id: 3,
      title: 'AI Accelerate',
      description: 'Module 3: AI Accelerate',
      order: 3,
      tasks: [
        {
          id: 13,
          title: 'Growth Partner',
          description: '1. Identify a big change you have to try in your business or job\n2. Share it with Chatgpt along with the roundtable review prompt and discuss the every aspects of the change multiple times\n3. Come back to share your learnings with others in the group and what would be your next steps. Confirm back to me when done to get your points.',
          videoLinks: ['https://youtube.com/watch?v=growth-partner'],
          status: 'pending',
          points: 50,
          moduleId: 3
        },
        {
          id: 14,
          title: 'Work Optimizer',
          description: '1. Share details of your daily, weekly or monthly work which takes a lot of time along with the prompt\n2. Dig deeper into the ideas shared by the AI and look for ways to implement it to gain productivity\n3. Come back to share your learnings with others in the group and what would be your next steps. Confirm back to me when done to get your points.',
          videoLinks: ['https://youtube.com/watch?v=work-optimizer'],
          status: 'pending',
          points: 50,
          moduleId: 3
        },
        {
          id: 15,
          title: 'Happiness Maximizer',
          description: '1. Identify 3-5 most useful people in your life who can connect you with big opportunities\n2. Work with the prompt to write a note of gratitude appreciating them for their presence and inspiration\n3. Come back to share your experience of interacting with them and what was the outcome. Confirm back to me when done to get your points.',
          videoLinks: ['https://youtube.com/watch?v=happiness-maximizer'],
          status: 'pending',
          points: 50,
          moduleId: 3
        },
        {
          id: 16,
          title: 'Content Creator',
          description: '1. Enter the prompt and answer the questions to get 10 posts that you can post on social media from today\n2. Publish your first post and schedule the next ones for future dates\n3. Come back to share your learnings with others in the group and what would be your next steps. Confirm back to me when done to get your points.',
          videoLinks: ['https://youtube.com/watch?v=content-creator'],
          status: 'pending',
          points: 50,
          moduleId: 3
        },
        {
          id: 17,
          title: 'Opportunity Creator',
          description: '1. Identify 3-5 most valuable prospects or people who can connect you to prospects\n2. Work with the prompt to write a note of gratitude appreciating them and ask for help with your offer\n3. Come back to share your experience of interacting with them and what was the outcome. Confirm back to me when done to get your points.',
          videoLinks: ['https://youtube.com/watch?v=opportunity-creator'],
          status: 'pending',
          points: 50,
          moduleId: 3
        },
        {
          id: 18,
          title: 'Health Coach',
          description: '1. Submit the prompt and answer every question in as much detail as possible\n2. Develop a customized health plan to lose weight, or get back to shape or any other health goal you have\n3. Come back to share your learnings with others in the group and what would be your next steps. Confirm back to your SuperCoach when done to get your points.',
          videoLinks: ['https://youtube.com/watch?v=health-coach'],
          status: 'pending',
          points: 50,
          moduleId: 3
        },
        {
          id: 19,
          title: 'AI Solution Maker',
          description: '1. Explore the links or sources provided to identify new tools of interest\n2. Create a list and start adding applications or tools that you want to explore and why\n3. Come back to share your learnings with others in the group and what would be your next steps. Confirm back to me when done to get your points.',
          videoLinks: ['https://youtube.com/watch?v=ai-solution-maker'],
          status: 'pending',
          points: 100,
          moduleId: 3
        },
        {
          id: 20,
          title: 'Give your overall feedback about the challenge',
          description: 'Share your honest feedback in the group and commit to being consistent going forward',
          videoLinks: ['https://youtube.com/watch?v=feedback-challenge'],
          status: 'pending',
          points: 100,
          moduleId: 3
        }
      ]
    }
  ],
  totalTasks: 20,
  completedTasks: 0,
  pendingTasks: 20,
  stuckTasks: 0,
  totalPoints: 1000,
  earnedPoints: 0
};

const demoCourse: Course = {
  id: 56,
  title: 'demo course',
  version: 3,
  modules: [
    {
      id: 1,
      title: 'demo',
      description: 'Module 1: demo',
      order: 1,
      tasks: [
        {
          id: 1,
          title: 'demo',
          description: 'demo',
          videoLinks: ['https://youtube.com/watch?v=demo-video-1'],
          status: 'completed',
          completionDate: '2024-01-15',
          points: 21,
          moduleId: 1
        }
      ]
    },
    {
      id: 2,
      title: 'some additions',
      description: 'Module 2: some additions',
      order: 2,
      tasks: [
        {
          id: 2,
          title: 'demo 2',
          description: 'Task 1: demo 2',
          videoLinks: ['https://youtube.com/watch?v=demo-video-2'],
          status: 'pending',
          points: 21,
          moduleId: 2
        },
        {
          id: 3,
          title: 'demo task',
          description: 'Task 2: demo task',
          videoLinks: ['https://youtube.com/watch?v=demo-video-3'],
          status: 'pending',
          points: 21,
          moduleId: 2
        },
        {
          id: 4,
          title: 'demo task',
          description: 'Task 3: demo task',
          videoLinks: ['https://youtube.com/watch?v=demo-video-4'],
          status: 'pending',
          points: 51,
          moduleId: 2
        }
      ]
    }
  ],
  totalTasks: 4,
  completedTasks: 1,
  pendingTasks: 3,
  stuckTasks: 0,
  totalPoints: 114,
  earnedPoints: 21
};

const sampleCourse: Course = {
  id: 1,
  title: 'One Crore Unicorn Coach Programme',
  version: 1,
  modules: [
    {
      id: 1,
      title: 'Step 1 - Craft Your Lifeboat Offer',
      description: 'Build the foundation of your coaching business with a compelling offer',
      order: 1,
      tasks: [
        {
          id: 1,
          title: 'Big/Urgent Problem to Solve',
          description: '1. Reflect on your personal skills, interests, and life experiences.\n2. Identify a problem that people regularly seek help for (painful or aspirational).\n3. Search forums, YouTube comments, or social posts to see how common it is.\n4. Validate the urgency and demand by talking to at least 3 potential audience members.\n5. Finalize the problem statement in one clear sentence.',
          videoLinks: ['https://youtube.com/watch?v=problem-solving'],
          status: 'completed',
          completionDate: '2024-01-10',
          points: 50,
          moduleId: 1
        },
        {
          id: 2,
          title: 'Your ICP',
          description: '1. List down demographic details (age, gender, profession, location).\n2. Define their inner world - pain points, desires, lifestyle, values.\n3. Clarify where they are today and where they want to go.\n4. Create a short persona story to visualize your ICP as one person.\n5. Validate this with real people using a poll, DM, or conversation.',
          videoLinks: ['https://youtube.com/watch?v=icp-creation'],
          status: 'completed',
          completionDate: '2024-01-12',
          points: 50,
          moduleId: 1
        },
        {
          id: 3,
          title: 'The Solution',
          description: '1. Choose a method you\'re confident in using (writing, art, therapy, etc.).\n2. Map how this method helps solve the problem you chose.\n3. Make sure it fits your audience\'s preferences (e.g., non-tech, creative).\n4. Describe the end outcome the solution delivers.\n5. Test it with one or two people to see if it resonates.',
          videoLinks: ['https://youtube.com/watch?v=solution-design'],
          status: 'pending',
          points: 50,
          moduleId: 1
        },
        {
          id: 4,
          title: 'The Framework',
          description: '1. Break your solution into 3-5 steps or pillars.\n2. Name each pillar (keep it simple and benefit-focused).\n3. Write 2-3 lines for what each pillar helps with.\n4. Check that the steps follow a clear journey (start → middle → result).\n5. Turn this into a visual or short explainer to share.',
          videoLinks: ['https://youtube.com/watch?v=framework-creation'],
          status: 'pending',
          points: 50,
          moduleId: 1
        },
        {
          id: 5,
          title: 'The Offer Statement',
          description: '1. Write a clear, compelling offer statement.\n2. Include the problem, solution, and transformation.\n3. Make it specific and measurable.\n4. Test with your target audience.\n5. Refine based on feedback.',
          videoLinks: ['https://youtube.com/watch?v=offer-statement'],
          status: 'stuck',
          points: 50,
          moduleId: 1
        }
      ]
    },
    {
      id: 2,
      title: 'Step 2 - Level 0 and Level 1 Programmes',
      description: 'Design your coaching programs and payment systems',
      order: 2,
      tasks: [
        {
          id: 6,
          title: 'Register for a Payment Gateway like RazorPay',
          description: '1. Create an account on Razorpay (or similar platform).\n2. Complete your KYC verification process.\n3. If they ask for additional info provide to get the account fully enabled.',
          videoLinks: ['https://youtube.com/watch?v=payment-gateway'],
          status: 'completed',
          completionDate: '2024-01-15',
          points: 50,
          moduleId: 2
        },
        {
          id: 7,
          title: 'Design your High-Ticket L2 Programme',
          description: '1. Make the programme all inclusive covering all aspects of the problem.\n2. Include recorded, group and 1-1 sessions to amplify the value.\n3. Make it flexible for anyone to join at any point and yet it is personalised to their needs.',
          videoLinks: ['https://youtube.com/watch?v=l2-programme'],
          status: 'pending',
          points: 50,
          moduleId: 2
        },
        {
          id: 8,
          title: 'Design your Low-Ticket L1 Programme',
          description: '1. Make a focused action packed recorded programme with an aim to get a result\n2. Include a weekly support session to answer any questions that they may have\n3. If you don\'t have it ready, you can create the first version live and give recordings to subsequent students from then on.',
          videoLinks: ['https://youtube.com/watch?v=l1-programme'],
          status: 'pending',
          points: 50,
          moduleId: 2
        },
        {
          id: 9,
          title: 'Design your High-Value L0 Programme',
          description: '1. Identify what you need to teach and what they need to do to make your prospects trust you as a coach\n2. Spit it to fewer number days with enough space to make them act and make progress and get hope\n3. Pitch your invitation based L2 and invite interested people to apply by paying a tiny deposit\n4. End the workshop with a downsell to L3 for those who are not ready to invest for your L2\n5. Review the engagement, value and conversions at the end of each batch and refine the next',
          videoLinks: ['https://youtube.com/watch?v=l0-programme'],
          status: 'stuck',
          points: 50,
          moduleId: 2
        },
        {
          id: 10,
          title: 'Design the build up to LO Programme',
          description: '1. Identify the best content needed to charge up your prospects who have registered for your workshop\n2. Plan out how to share them across the days from around 7 days away until the start of the 1st day\n3. Ensure that there are different type of content (value, testimonials, stories) and they are in different format (image, video, text, meme, etc)\n4. Open up the session',
          videoLinks: ['https://youtube.com/watch?v=build-up-content'],
          status: 'pending',
          points: 50,
          moduleId: 2
        },
        {
          id: 11,
          title: 'Create Your Payment Links for all Programmes',
          description: '1. Go to "Payment Links" and create a new one.\n2. Add details like title, description, amount, and success message.\n3. Copy the link and save it for workshop promotion.',
          videoLinks: ['https://youtube.com/watch?v=payment-links'],
          status: 'pending',
          points: 50,
          moduleId: 2
        }
      ]
    },
    {
      id: 3,
      title: 'Step 3 - Community Formation',
      description: 'Build and engage your community for long-term success',
      order: 3,
      tasks: [
        {
          id: 12,
          title: 'The WhatsApp Community',
          description: '1. Create a new WhatsApp group and name it based on the goal/problem.\n2. Set a strong group description stating who it\'s for and what you\'ll share.\n3. Add a profile image that reflects your brand/message.\n4. Set group settings to admin-only posting (for now).\n5. Generate an invite link and save it for outreach/promotion.',
          videoLinks: ['https://youtube.com/watch?v=whatsapp-community'],
          status: 'completed',
          completionDate: '2024-01-18',
          points: 50,
          moduleId: 3
        },
        {
          id: 13,
          title: 'Your Pitch to Join the Community',
          description: '1. Write a short, engaging message introducing yourself.\n2. Mention the purpose of the WhatsApp community and the benefit of joining.\n3. Add the invite link at the end.\n4. Share this pitch across your network, social media, and DMs.',
          videoLinks: ['https://youtube.com/watch?v=community-pitch'],
          status: 'pending',
          points: 50,
          moduleId: 3
        },
        {
          id: 14,
          title: '15 Day Community Content Plan',
          description: '1. Open a sheet or planner and map out 15 days of content.\n2. Plan for 1-2 posts per day: mix formats like text, voice, video, meme, or poll.\n3. Divide content types: 40% educational, 30% inspirational, 20% engagement, 10% promotional.\n4. Keep posts short, relatable, and consistent.',
          videoLinks: ['https://youtube.com/watch?v=content-planning'],
          status: 'pending',
          points: 50,
          moduleId: 3
        },
        {
          id: 15,
          title: 'Plan your Schedule for Posting',
          description: '1. Identify the time when you will post each day\n2. Make your content easily accessible from anywhere\n3. Block your slot and ensure you post at or around that time everyday',
          videoLinks: ['https://youtube.com/watch?v=posting-schedule'],
          status: 'pending',
          points: 50,
          moduleId: 3
        },
        {
          id: 16,
          title: 'Day 1 Community Content',
          description: '1. Write a welcome message or your origin story.\n2. Include a call to action: ask a question or encourage replies.\n3. Post it to the group and engage with reactions.',
          videoLinks: ['https://youtube.com/watch?v=day1-content'],
          status: 'stuck',
          points: 50,
          moduleId: 3
        }
      ]
    },
    {
      id: 4,
      title: 'Step 4 - First Workshop',
      description: 'Deliver your first paid workshop and generate revenue',
      order: 4,
      tasks: [
        {
          id: 17,
          title: 'Announce Your First Paid Workshop',
          description: '1. Write a post for your community announcing your upcoming paid workshop.\n2. Mention what the workshop will help them achieve.\n3. Include the date, time, and your payment link.\n4. Ask those who pay to join a separate paid WhatsApp group.',
          videoLinks: ['https://youtube.com/watch?v=workshop-announcement'],
          status: 'completed',
          completionDate: '2024-01-20',
          points: 50,
          moduleId: 4
        },
        {
          id: 18,
          title: 'Promote Your First Paid Workshop',
          description: '1. Identify Social Media Channels and Content type\n2. Create content using AI and add it to a google sheet\n3. Schedule the content posts on platforms and engage with those who interact\n4. Clarify their questions and get them to join',
          videoLinks: ['https://youtube.com/watch?v=workshop-promotion'],
          status: 'pending',
          points: 50,
          moduleId: 4
        },
        {
          id: 19,
          title: 'Create Detailed Daywise Outline your LO Workshop',
          description: '1. Decide the length of the workshop (3 or 5 days).\n2. List key outcomes participants should achieve.\n3. Break outcomes into daily lessons or tasks.\n4. Add one practical exercise per day.\n5. Finalize a clear title and day-wise structure.',
          videoLinks: ['https://youtube.com/watch?v=workshop-outline'],
          status: 'pending',
          points: 50,
          moduleId: 4
        },
        {
          id: 20,
          title: 'Get your first Paid Customer for Workshop',
          description: '1. Share payment link regularly in the free community.\n2. Personally message 5-10 engaged members.\n3. Create urgency by adding reminders and deadline-based offers.\n4. Acknowledge every payment publicly in the group to build momentum.',
          videoLinks: ['https://youtube.com/watch?v=first-customer'],
          status: 'pending',
          points: 50,
          moduleId: 4
        },
        {
          id: 21,
          title: 'Warm up the Workshop Group',
          description: '1. 5-7 days before the workshop, start posting countdown messages.\n2. Share topics and structure of the workshop.\n3. Use daily reminders like \'2 Days to Go — Here\'s what you\'ll learn\'.\n4. Add emojis or design to make posts more visual.',
          videoLinks: ['https://youtube.com/watch?v=workshop-warmup'],
          status: 'stuck',
          points: 50,
          moduleId: 4
        },
        {
          id: 22,
          title: 'Start creating Slides, Tasks and Content for Day 1 and Beyond',
          description: '1. Visualise the experience for each day\n2. Gather and start including concepts, stories and tasks\n3. Review the flow of session and keep improving it',
          videoLinks: ['https://youtube.com/watch?v=workshop-content'],
          status: 'pending',
          points: 50,
          moduleId: 4
        },
        {
          id: 23,
          title: 'Create Pre-workshop Excitement',
          description: '1. On the day of the workshop, ask participants to introduce themselves.\n2. Use a support number (or alternate number) to post the first message.\n3. Provide a format: Name, what they do, mood, and expectations.\n4. Encourage others to reply with their own intros.',
          videoLinks: ['https://youtube.com/watch?v=pre-workshop'],
          status: 'pending',
          points: 50,
          moduleId: 4
        },
        {
          id: 24,
          title: 'Review and be ready with content and delivery for the workshop',
          description: '1. Visualise the experience for each day\n2. Refine, reorder and optimise concepts, stories and tasks for each day and beyond\n3. Review the flow of session and ensure that you are ready',
          videoLinks: ['https://youtube.com/watch?v=workshop-review'],
          status: 'pending',
          points: 50,
          moduleId: 4
        },
        {
          id: 25,
          title: 'Deliver the first Session with Energy',
          description: '1. Start on time and welcome everyone warmly.\n2. Share the agenda and set expectations.\n3. Maintain high energy with examples and real stories.\n4. End with key takeaways and a hook for Day 2.',
          videoLinks: ['https://youtube.com/watch?v=first-session'],
          status: 'pending',
          points: 50,
          moduleId: 4
        },
        {
          id: 26,
          title: 'Have your pitch slides Ready',
          description: '1. Create a clear offer with bonuses\n2. Assign prices for each bonus with 3D Boxes\n3. Add them to the slides and have testimonials for each product\n4. Practice pitching it on zoom and review your performance\n5. Be ready to pitch with confidence and energy',
          videoLinks: ['https://youtube.com/watch?v=pitch-slides'],
          status: 'pending',
          points: 50,
          moduleId: 4
        },
        {
          id: 27,
          title: 'Make your first Pitch',
          description: '1. Pitch your initiation only high ticket product\n2. Reveal the prices and the application process\n3. Invite them to apply for a 1-1 discussion and how it can help them achieve their goal\n4. Focus on how your system, time and attention will help them go faster.',
          videoLinks: ['https://youtube.com/watch?v=first-pitch'],
          status: 'pending',
          points: 50,
          moduleId: 4
        }
      ]
    },
    {
      id: 5,
      title: 'Step 5 - Post Workshop Work',
      description: 'Optimize and scale your workshop based on feedback',
      order: 5,
      tasks: [
        {
          id: 28,
          title: 'Seek Feedback From Participants',
          description: '1. Create a simple Google Form with 3-5 questions.\n2. Ask about what they liked, what could improve, and what they want next.\n3. Share the link on the final day and encourage quick responses.\n4. Thank everyone who fills it and offer something extra if needed.',
          videoLinks: ['https://youtube.com/watch?v=feedback-collection'],
          status: 'completed',
          completionDate: '2024-01-22',
          points: 50,
          moduleId: 5
        },
        {
          id: 29,
          title: 'Have Conversations with Willing Participants',
          description: '1. Reach out to those who participated in the programme with energy and ask for a quick call with them\n2. If they are busy, send your question or feedback request via WhatsApp and give them time\n3. Incentivise feedback by giving them a freebie for their time and honest thoughts',
          videoLinks: ['https://youtube.com/watch?v=participant-conversations'],
          status: 'pending',
          points: 50,
          moduleId: 5
        },
        {
          id: 30,
          title: 'Make Changes to the Workshop',
          description: '1. Review the feedback received.\n2. Identify common suggestions or pain points.\n3. Update content, flow, or tools accordingly.\n4. Make a checklist of improvements before your next run.',
          videoLinks: ['https://youtube.com/watch?v=workshop-improvements'],
          status: 'pending',
          points: 50,
          moduleId: 5
        },
        {
          id: 31,
          title: 'Plan the Next Workshop',
          description: '1. Decide if you want to repeat the same workshop or change topic.\n2. Review what worked last time (sales, content, community).\n3. Block dates in your calendar for marketing and delivery.\n4. Announce early to your existing group to get early buyers.',
          videoLinks: ['https://youtube.com/watch?v=next-workshop'],
          status: 'stuck',
          points: 50,
          moduleId: 5
        }
      ]
    },
    {
      id: 6,
      title: 'Step 6 - Ad Manager and Facebook Ads',
      description: 'Scale your reach with Facebook advertising',
      order: 6,
      tasks: [
        {
          id: 32,
          title: 'Facebook Business Manager Setup',
          description: '1. Go to business.facebook.com and create a Business Manager account.\n2. Add your Facebook Page and Ad Account.\n3. Set up your payment method.\n4. Create a new campaign and install the Meta Pixel if needed.',
          videoLinks: ['https://youtube.com/watch?v=fb-business-manager'],
          status: 'completed',
          completionDate: '2024-01-25',
          points: 50,
          moduleId: 6
        },
        {
          id: 33,
          title: 'Creative, Copy and Competition Research',
          description: '1. Chat with AI to identify the best sources for Ad Copy and Ad Creative inspiration.\n2. Look through different ideas and save them for reference for later.\n3. Review the one saved and pick the best for your campaign.',
          videoLinks: ['https://youtube.com/watch?v=ad-research'],
          status: 'pending',
          points: 50,
          moduleId: 6
        },
        {
          id: 34,
          title: 'Ad Hook and Headline',
          description: '1. Document different hooks and headlines for your campaign.\n2. Save all the ones you get in a document and track the ones used.\n3. Pick the best bets and build your ad copy and creative around it.',
          videoLinks: ['https://youtube.com/watch?v=ad-hooks'],
          status: 'pending',
          points: 50,
          moduleId: 6
        },
        {
          id: 35,
          title: 'Ad Copy',
          description: '1. Write 2-3 variations of a short ad message.\n2. Focus on a pain point, transformation, and urgency.\n3. Example: \'Struggling to grow your side income? Join my 3-day WhatsApp workshop and get clarity.\'\n4. Keep it under 300 characters.',
          videoLinks: ['https://youtube.com/watch?v=ad-copy'],
          status: 'pending',
          points: 50,
          moduleId: 6
        },
        {
          id: 36,
          title: 'Ad Creative',
          description: '1. Use Canva or similar tool.\n2. Add your photo, workshop title, date, and a hook.\n3. Make it easy to read even on mobile.\n4. Create 2-3 variations and test which one gets better response.',
          videoLinks: ['https://youtube.com/watch?v=ad-creative'],
          status: 'pending',
          points: 50,
          moduleId: 6
        },
        {
          id: 37,
          title: 'Ad Copy & Creative Review & Rework',
          description: '1. Join a support session and share your work\n2. Make a note of the feedback and incorporate it',
          videoLinks: ['https://youtube.com/watch?v=ad-review'],
          status: 'pending',
          points: 50,
          moduleId: 6
        },
        {
          id: 38,
          title: 'Schedule Your First Lead Ad Campaign',
          description: '1. Choose objective: "Leads."\n2. Set audience: age, location, interests.\n3. Upload your ad creative and copy.\n4. Create a lead form that asks for name, email, and WhatsApp number.\n5. Launch with ₹200-₹300/day budget per ad set to test.',
          videoLinks: ['https://youtube.com/watch?v=lead-campaign'],
          status: 'pending',
          points: 50,
          moduleId: 6
        },
        {
          id: 39,
          title: 'Campaign Review',
          description: '1. Join a support session and share your work.\n2. Make a note of the feedback and incorporate it.\n3. Make the campaign live.',
          videoLinks: ['https://youtube.com/watch?v=campaign-review'],
          status: 'stuck',
          points: 50,
          moduleId: 6
        }
      ]
    },
    {
      id: 7,
      title: 'Step 7 - Lead Followup',
      description: 'Convert leads into paying customers through effective follow-up',
      order: 7,
      tasks: [
        {
          id: 40,
          title: 'Setup Lead Connect Automation',
          description: '1. Set up automated welcome messages for new leads.\n2. Create a sequence of follow-up messages.\n3. Include value-driven content and soft pitches.\n4. Track engagement and optimize based on responses.',
          videoLinks: ['https://youtube.com/watch?v=lead-automation'],
          status: 'completed',
          completionDate: '2024-01-28',
          points: 50,
          moduleId: 7
        },
        {
          id: 41,
          title: 'Create a Lead Magnet to Share',
          description: '1. Design a valuable free resource related to your workshop.\n2. Make it easy to download and share.\n3. Include your contact information and workshop details.\n4. Promote it in your ads and community.',
          videoLinks: ['https://youtube.com/watch?v=lead-magnet'],
          status: 'pending',
          points: 50,
          moduleId: 7
        },
        {
          id: 42,
          title: 'Track Ad Performance',
          description: '1. Monitor key metrics: CTR, CPC, conversion rate.\n2. Identify top-performing ad creatives and copy.\n3. Pause underperforming ads and scale winners.\n4. Optimize targeting based on audience insights.',
          videoLinks: ['https://youtube.com/watch?v=ad-tracking'],
          status: 'pending',
          points: 50,
          moduleId: 7
        },
        {
          id: 43,
          title: 'Track Community Engagement',
          description: '1. Monitor community growth and engagement rates.\n2. Track which content gets the most interaction.\n3. Identify your most active community members.\n4. Use insights to improve content strategy.',
          videoLinks: ['https://youtube.com/watch?v=community-tracking'],
          status: 'stuck',
          points: 50,
          moduleId: 7
        }
      ]
    }
  ],
  totalTasks: 43,
  completedTasks: 8,
  pendingTasks: 30,
  stuckTasks: 5,
  totalPoints: 2150,
  earnedPoints: 400
};

interface CourseDetailsProps {
  courseId?: number;
  onHome?: () => void;
}

export default function CourseDetails({ courseId = 1, onHome }: CourseDetailsProps) {
  const getCourseData = (id: number): Course => {
    switch (id) {
      case 53:
        return aiChallengeCourse;
      case 56:
        return demoCourse;
      case 1:
      default:
        return sampleCourse;
    }
  };

  const [course, setCourse] = useState<Course>(getCourseData(courseId));
  // Load from backend if available
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchCourseDetails(courseId);
        if (data) {
          // Expect backend to provide modules and tasks; do a minimal normalization
          const normalized: Course = {
            id: Number(data.id ?? courseId),
            title: String(data.title ?? 'Course'),
            version: Number(data.version ?? 1),
            modules: (data.modules ?? []).map((m: any, idx: number) => ({
              id: Number(m.id ?? idx + 1),
              title: String(m.title ?? `Module ${idx + 1}`),
              description: String(m.description ?? ''),
              order: Number(m.order ?? idx + 1),
              tasks: (m.tasks ?? []).map((t: any, tIdx: number) => ({
                id: Number(t.id ?? tIdx + 1),
                title: String(t.title ?? `Task ${tIdx + 1}`),
                description: String(t.description ?? ''),
                contentLinks: t.contentLinks ?? [],
                videoLinks: t.videoLinks ?? [],
                dueDate: t.dueDate,
                completionDate: t.completionDate,
                status: (t.status ?? 'pending') as Task['status'],
                points: Number(t.points ?? 0),
                moduleId: Number(m.id ?? idx + 1)
              }))
            })),
            totalTasks: Number(data.totalTasks ?? 0),
            completedTasks: Number(data.completedTasks ?? 0),
            pendingTasks: Number(data.pendingTasks ?? 0),
            stuckTasks: Number(data.stuckTasks ?? 0),
            totalPoints: Number(data.totalPoints ?? 0),
            earnedPoints: Number(data.earnedPoints ?? 0)
          };
          setCourse(normalized);
        }
      } catch (e) {
        // keep local fallback
      }
    };
    load();
  }, [courseId]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([1])); // First module expanded by default
  const [activeTab, setActiveTab] = useState<NavigationTab>('tasks');
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const handleNavigation = (tab: NavigationTab) => {
    setActiveTab(tab);
  };

  const getAllTasks = () => {
    return course.modules.flatMap(module => module.tasks);
  };

  const handleTaskStatusChange = async (taskId: number, newStatus: 'completed' | 'pending' | 'stuck') => {
    console.log('Task status change triggered:', { taskId, newStatus });
    try {
      if (newStatus === 'completed') {
        await markTaskAsCompleted(taskId);
      }
    } catch (e) {
      // non-blocking; continue to update UI
    }
    const task = getAllTasks().find(t => t.id === taskId);
    if (!task) {
      console.log('Task not found:', taskId);
      return;
    }

    const oldStatus = task.status;
    const points = task.points;
    console.log('Updating task:', { taskId, oldStatus, newStatus, points });

    setCourse(prev => {
      const updatedModules = prev.modules.map(module => ({
        ...module,
        tasks: module.tasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                status: newStatus,
                completionDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined
              }
            : t
        )
      }));

      // Calculate new counts
      const allTasks = updatedModules.flatMap(m => m.tasks);
      const completedTasks = allTasks.filter(t => t.status === 'completed').length;
      const pendingTasks = allTasks.filter(t => t.status === 'pending').length;
      const stuckTasks = allTasks.filter(t => t.status === 'stuck').length;
      const earnedPoints = allTasks
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.points, 0);

      return {
        ...prev,
        modules: updatedModules,
        completedTasks,
        pendingTasks,
        stuckTasks,
        earnedPoints
      };
    });
  };

  const getFilteredTasks = () => {
    const allTasks = getAllTasks();
    if (activeFilter === 'all') return allTasks;
    return allTasks.filter(task => task.status === activeFilter);
  };

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const toggleModuleExpansion = (moduleId: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const summaryCards = [
    {
      title: 'Total Tasks',
      value: course.totalTasks,
      icon: Target,
      color: 'bg-[#3A5BC7]',
      textColor: 'text-white',
      filter: 'all' as FilterType,
      key: 'total'
    },
    {
      title: 'Completed',
      value: course.completedTasks,
      icon: CheckCircle,
      color: 'bg-[#32CD32]',
      textColor: 'text-black',
      filter: 'completed' as FilterType,
      key: 'completed'
    },
    {
      title: 'Pending',
      value: course.pendingTasks,
      icon: Clock,
      color: 'bg-[#FFA500]',
      textColor: 'text-black',
      filter: 'pending' as FilterType,
      key: 'pending'
    },
    {
      title: 'Stuck',
      value: course.stuckTasks,
      icon: AlertTriangle,
      color: 'bg-[#FF4500]',
      textColor: 'text-white',
      filter: 'stuck' as FilterType,
      key: 'stuck'
    }
  ];

  const filteredTasks = getFilteredTasks();

  // Navigation logic based on activeTab
  if (activeTab === 'rankings') {
    return <Leaderboard onBack={() => setActiveTab('tasks')} onHome={onHome} activeTab={activeTab} onNavigate={handleNavigation} />;
  }

  if (activeTab === 'points') {
    return <PointsPage activeTab={activeTab} onNavigate={handleNavigation} onHome={onHome} />;
  }

  if (activeTab === 'home') {
    // For now, redirect to tasks since we don't have a separate home screen
    // In a real app, this would navigate to a home dashboard
    if (onHome) onHome();
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C1445] to-[#1E2A78]">
      {/* Header */}
      <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">
              {course.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A0AEC0]">
              Version {course.version} • {course.modules.length} Modules
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {summaryCards.map((card, index) => {
              const keys = ['total','completed','pending','stuck'] as const;
              const cardKey = keys[index] ?? `card-${index}`;
              return (
                <button
                  key={cardKey}
                  onClick={() => { handleFilterClick(card.filter); setActiveCard(cardKey); }}
                  className={`bg-[#1A2453] rounded-lg p-2 sm:p-3 shadow-md transition-all duration-200 text-left w-full ${
                    activeCard === cardKey ? 'ring-2 ring-[#3A5BC7] ring-opacity-70 shadow-xl' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className={`p-1 sm:p-1.5 rounded-md ${card.color}`}>
                      <card.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${card.textColor}`} />
                    </div>
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-white mb-0.5">
                    {card.value}
                  </div>
                  <div className="text-xs text-[#A0AEC0] leading-tight">
                    {card.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="bg-[#1A2453] rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-white">Course Progress</h3>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#32CD32]" />
                <span className="text-[#32CD32] font-medium text-xs sm:text-sm">
                  {Math.round((course.completedTasks / course.totalTasks) * 100)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-[#0C1445] rounded-full h-1.5 sm:h-2">
              <div
                className="bg-gradient-to-r from-[#32CD32] to-[#28A745] h-1.5 sm:h-2 rounded-full transition-all duration-500"
                style={{ width: `${(course.completedTasks / course.totalTasks) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-[#A0AEC0]">
              <span>{course.completedTasks} completed</span>
              <span>{course.totalTasks} total tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules and Tasks List */}
      <div className="px-3 sm:px-6 lg:px-8 pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-white">
              {activeFilter === 'all' ? 'Course Modules' : 
               activeFilter === 'completed' ? 'Completed Tasks' :
               activeFilter === 'pending' ? 'Pending Tasks' :
               'Stuck Tasks'} 
              {activeFilter !== 'all' && ` (${filteredTasks.length})`}
            </h2>
            <div className="flex items-center gap-1.5 text-[#A0AEC0]">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs">Earn points by completing tasks</span>
            </div>
          </div>

          {activeFilter === 'all' ? (
            <div className="space-y-4 sm:space-y-6">
              {course.modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  isExpanded={expandedModules.has(module.id)}
                  onToggleExpansion={() => toggleModuleExpansion(module.id)}
                  onTaskStatusChange={handleTaskStatusChange}
                />
              ))}
            </div>
          ) : (
            <>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-[#A0AEC0] mb-3 sm:mb-4">
                    {activeFilter === 'completed' && <CheckCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4" />}
                    {activeFilter === 'pending' && <Clock className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4" />}
                    {activeFilter === 'stuck' && <AlertTriangle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4" />}
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                    No {activeFilter} tasks found
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A0AEC0]">
                    {activeFilter === 'completed' && "You haven't completed any tasks yet."}
                    {activeFilter === 'pending' && "No pending tasks at the moment."}
                    {activeFilter === 'stuck' && "No stuck tasks - great job!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 transition-all duration-300">
                  {filteredTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="animate-fadeIn"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TaskCard
                        task={task}
                        onStatusChange={(newStatus) => handleTaskStatusChange(task.id, newStatus)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A2453] border-t border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 sm:gap-8">
          <button
            onClick={() => handleNavigation('home')}
            className="flex flex-col items-center gap-1 transition-colors duration-200 text-[#A0AEC0] hover:text-white"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => handleNavigation('tasks')}
            className="flex flex-col items-center gap-1 transition-colors duration-200 text-white"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Tasks</span>
          </button>
          <button
            onClick={() => handleNavigation('points')}
            className="flex flex-col items-center gap-1 transition-colors duration-200 text-[#A0AEC0] hover:text-white"
          >
            <Star className="w-5 h-5" />
            <span className="text-xs">Points</span>
          </button>
          <button
            onClick={() => handleNavigation('rankings')}
            className="flex flex-col items-center gap-1 transition-colors duration-200 text-[#A0AEC0] hover:text-white"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Rankings</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}


function ModuleCard({ 
  module, 
  isExpanded, 
  onToggleExpansion, 
  onTaskStatusChange 
}: { 
  module: Module; 
  isExpanded: boolean; 
  onToggleExpansion: () => void; 
  onTaskStatusChange: (taskId: number, newStatus: 'completed' | 'pending' | 'stuck') => void;
}) {
  const completedTasks = module.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = module.tasks.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <div className="bg-[#1A2453] rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Module Header */}
      <div 
        className="p-3 sm:p-4 cursor-pointer hover:bg-[#1A2453]/80 transition-colors duration-200"
        onClick={onToggleExpansion}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#3A5BC7] rounded-md flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {module.order}
              </div>
              <h3 className="text-sm sm:text-lg font-semibold text-white leading-tight">
                {module.title}
              </h3>
            </div>
            <p className="text-[#A0AEC0] mb-2 text-xs sm:text-sm">
              {module.description}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs text-[#A0AEC0]">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>{completedTasks}/{totalTasks} tasks completed</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{Math.round(progressPercentage)}% complete</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 sm:w-24 bg-[#0C1445] rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-[#32CD32] to-[#28A745] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors duration-200">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 text-[#A0AEC0] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Module Tasks */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-white/5">
          <div className="space-y-2 mt-3">
            {module.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={(newStatus) => onTaskStatusChange(task.id, newStatus)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ 
  task, 
  onStatusChange 
}: { 
  task: Task; 
  onStatusChange: (newStatus: 'completed' | 'pending' | 'stuck') => void;
}) {


  return (
    <div className="bg-[#1A2453] rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 group hover:ring-1 hover:ring-[#3A5BC7] hover:ring-opacity-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1.5 gap-2">
            <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-blue-200 transition-colors duration-200 leading-tight flex-1">
              {task.title}
            </h4>
            <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
              // For demo course (course 56)
              (task.moduleId === 1 && task.id === 1) || (task.moduleId === 1 && task.id === 3) ? 'bg-[#32CD32] text-black' : 
              // For AI Challenge course (course 53) - only task 6 and 7 in module 1, and task 20 in module 3 are bonus
              (task.moduleId === 1 && (task.id === 6 || task.id === 7)) || (task.moduleId === 3 && task.id === 20) ? 'bg-[#32CD32] text-black' : 
              'bg-[#FF4500] text-white'
            }`}>
              {(task.moduleId === 1 && (task.id === 1 || task.id === 3)) || 
               (task.moduleId === 1 && (task.id === 6 || task.id === 7)) || 
               (task.moduleId === 3 && task.id === 20) ? 'bonus' : 'mandatory'}
            </div>
          </div>
          <div className="text-xs text-[#A0AEC0] mb-2 whitespace-pre-line leading-relaxed">
            {task.description}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-[#32CD32] font-semibold">{task.points}</span>
              <span className="text-[#A0AEC0]">Reward Points</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#FF4500] font-semibold">{task.points}</span>
              <span className="text-[#A0AEC0]">Penalty Points</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#3A5BC7] font-semibold">{
                // For demo course (course 56)
                task.moduleId === 1 && task.id === 1 ? '5' : 
                task.moduleId === 1 && task.id === 2 ? '5' : 
                task.moduleId === 1 && task.id === 3 ? '7' : 
                task.moduleId === 1 && task.id === 4 ? '2' :
                // For AI Challenge course (course 53) - most tasks are 1 day, some are 2 days
                task.moduleId === 1 && task.id === 1 ? '2' : // Life Coach
                task.moduleId === 1 && task.id === 2 ? '1' : // Daily Planner
                task.moduleId === 1 && task.id === 3 ? '1' : // Writing Assistant
                task.moduleId === 1 && task.id === 4 ? '1' : // Learning Friend
                task.moduleId === 1 && task.id === 5 ? '1' : // Speed Grasper
                task.moduleId === 1 && task.id === 6 ? '0' : // Question of the Week
                task.moduleId === 1 && task.id === 7 ? '1' : // AI Journey
                task.moduleId === 2 && task.id === 8 ? '1' : // Relationship Coach
                task.moduleId === 2 && task.id === 9 ? '1' : // Prep Buddy
                task.moduleId === 2 && task.id === 10 ? '1' : // Supportive Critic
                task.moduleId === 2 && task.id === 11 ? '1' : // Creative Amplifier
                task.moduleId === 2 && task.id === 12 ? '1' : // Research Assistant
                task.moduleId === 3 && task.id === 13 ? '2' : // Growth Partner
                task.moduleId === 3 && task.id === 14 ? '1' : // Work Optimizer
                task.moduleId === 3 && task.id === 15 ? '1' : // Happiness Maximizer
                task.moduleId === 3 && task.id === 16 ? '1' : // Content Creator
                task.moduleId === 3 && task.id === 17 ? '1' : // Opportunity Creator
                task.moduleId === 3 && task.id === 18 ? '1' : // Health Coach
                task.moduleId === 3 && task.id === 19 ? '1' : // AI Solution Maker
                task.moduleId === 3 && task.id === 20 ? '0' : // Feedback
                '1'
              }</span>
              <span className="text-[#A0AEC0]">Days to Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Links */}
      {task.videoLinks?.length && (
        <div className="mb-2">
          <div className="text-xs text-[#A0AEC0] mb-1">Video Links:</div>
          <div className="flex flex-wrap gap-1.5">
            {task.videoLinks.map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3A5BC7] hover:text-[#2E4AA3] text-xs underline"
              >
                Video {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end">
        {task.status === 'completed' ? (
          <div className="px-3 py-1.5 bg-[#32CD32] text-black rounded-md font-medium flex items-center gap-1.5 text-sm">
            <CheckCircle className="w-3 h-3" />
            Completed
          </div>
        ) : (
        <button
            onClick={() => {
              console.log('Mark as completed button clicked for task:', task.id);
              onStatusChange('completed');
            }}
            className="px-3 py-1.5 bg-[#007BFF] hover:bg-[#0056b3] text-white rounded-md font-medium transition-colors duration-200 flex items-center gap-1.5 text-sm"
          >
            <CheckCircle className="w-3 h-3" />
          Mark as Completed
        </button>
        )}
      </div>
    </div>
  );
}