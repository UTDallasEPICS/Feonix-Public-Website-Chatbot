import type { WelcomeScreenProps } from "../types/chat";

export function WelcomeScreen({
  welcomeMessage,
  privacyPolicyUrl,
  exampleQuestions,
  onQuestionSelect,
}: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 text-center bg-ecf2fb">
      <div className="max-w-sm">
        <h2 className="text-lg font-semibold text-173052 mb-3">
          {welcomeMessage}
        </h2>

        {privacyPolicyUrl && (
          <p className="text-sm text-00171f mb-6">
            We respect your privacy.{" "}
            <a
              href={privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-0d63e7 hover:text-1084ec font-medium transition-colors"
            >
              Learn more
            </a>
          </p>
        )}
        {exampleQuestions && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-173052 uppercase tracking-wide mb-4">
              Try asking:
            </p>
            {exampleQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => onQuestionSelect(q.question)}
                className="w-full px-4 py-3 text-sm text-173052 bg-white border border-ecf2fb hover:bg-ecf2fb hover:border-0d63e7 transition-all duration-200 text-left"
              >
                {q.question}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
