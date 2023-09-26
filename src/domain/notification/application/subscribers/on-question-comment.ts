import { DomainEvents } from "@/core/events/domain-events";
import { EventHandler } from "@/core/events/event-handler";
import { SendNotificationUseCase } from "../use-cases/send-notification";
import { QuestionCommentEvent } from "@/domain/forum/enterprise/events/question-comment-event";
import { QuestionsRepository } from "@/domain/forum/application/repositories/questions-repository";

export class OnQuestionComment implements EventHandler {
  constructor(
    private questionsRepository: QuestionsRepository,
    private sendNotification: SendNotificationUseCase
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendQuestionCommentNotification.bind(this),
      QuestionCommentEvent.name
    );
  }

  private async sendQuestionCommentNotification({
    questionComment,
  }: QuestionCommentEvent) {
    const question = await this.questionsRepository.findById(
      questionComment.questionId.toString()
    );
    if (question) {
      await this.sendNotification.execute({
        recipientId: question.authorId.toString(),
        title: `Novo comentário em ${question.title
          .substring(0, 40)
          .concat("...")}"}!`,
        content: questionComment.content.substring(0, 40).concat("..."),
      });
    }
  }
}
