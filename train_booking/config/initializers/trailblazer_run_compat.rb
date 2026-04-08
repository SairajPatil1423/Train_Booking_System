module TrailblazerRunCompat
  def run(options = {})
    call(normalize_run_options(options))
  end

  private

  def normalize_run_options(options)
    normalized = normalize_hash(options)
    params = normalized[:params]

    return normalized unless params

    extracted_params =
      if params.respond_to?(:to_unsafe_h)
        normalize_hash(params.to_unsafe_h)
      elsif params.respond_to?(:to_h)
        normalize_hash(params.to_h)
      else
        {}
      end

    resource_payload = extract_resource_payload(params, extracted_params)
    extracted_params.merge!(resource_payload) if resource_payload

    normalized_params = extracted_params.merge(normalized.except(:params))

    normalized_params.merge(normalized).tap do |result|
      result[:params] = normalized_params
    end
  end

  def normalize_hash(value)
    return value.deep_symbolize_keys if value.respond_to?(:deep_symbolize_keys)
    return value.to_h if value.respond_to?(:to_h)

    {}
  end

  def extract_resource_payload(raw_params, params_hash)
    controller_name = raw_params[:controller].presence || params_hash[:controller].to_s
    return if controller_name.empty?

    resource_key = controller_name.split("/").last.singularize.to_sym
    payload = raw_params[resource_key] || raw_params[resource_key.to_s] || params_hash[resource_key]
    return unless payload.respond_to?(:to_h)

    normalize_hash(payload)
  end
end

Trailblazer::Operation.singleton_class.prepend(TrailblazerRunCompat)
